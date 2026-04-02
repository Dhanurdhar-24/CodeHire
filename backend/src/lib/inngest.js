import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";
import { clerkClient } from "@clerk/express";
import { Resend } from "resend";

export const inngest = new Inngest({ id: "code-hire" });
const resend = new Resend(process.env.RESEND_API_KEY);

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = event.data;
    const role = unsafe_metadata?.role || "participant";
    const organization = unsafe_metadata?.organization || "";

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      profileImage: image_url,
      role,
      organization,
    };

    if (role === "interviewer") {
      newUser.approvalToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    const user = await User.create(newUser);

    // sync to clerk public metadata
    await clerkClient.users.updateUserMetadata(id, {
      publicMetadata: {
        role,
        isApproved: newUser.isApproved !== undefined ? newUser.isApproved : (role === "participant"),
      },
    });

    if (role === "interviewer") {
      await inngest.send({
        name: "email/send-approval",
        data: {
          clerkId: id,
          email: newUser.email,
          name: newUser.name,
          organization: newUser.organization,
          approvalToken: newUser.approvalToken,
        },
      });
    }

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

const sendApprovalEmail = inngest.createFunction(
  { id: "send-approval-email" },
  { event: "email/send-approval" },
  async ({ event }) => {
    const { clerkId, email, name, organization, approvalToken } = event.data;

    const backendUrl = "http://localhost:3000";
    const approveLink = `${backendUrl}/api/admin/approve?clerkId=${clerkId}&token=${approvalToken}`;
    const declineLink = `${backendUrl}/api/admin/decline?clerkId=${clerkId}&token=${approvalToken}`;

    await resend.emails.send({
      from: "CodeHire <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "dhanurdharyadav62@gmail.com",
      subject: `Action Required: Approve Interviewer - ${name}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; line-height: 1.5;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 48px 32px; border-radius: 24px 24px 0 0; text-align: center;">
            <div style="background: rgba(255, 255, 255, 0.2); width: 64px; height: 64px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
              <span style="font-size: 32px;">💼</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">
              Interviewer Approval Requested
            </h1>
          </div>

          <div style="padding: 40px 32px; background: #ffffff; border: 1px solid #f3f4f6; border-top: none; border-radius: 0 0 24px 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; margin-bottom: 32px;">
              Hi Admin, <br/><br/>
              A new user has requested <strong>Interviewer</strong> status on the CodeHire platform. Please review the details below.
            </p>

            <div style="background: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 40px; border: 1px solid #f1f5f9;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;">Full Name</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Organization</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${organization || "Not Provided"}</td>
                </tr>
              </table>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <a href="${approveLink}" style="display: block; background: #6366f1; color: #ffffff; padding: 16px; border-radius: 12px; text-decoration: none; text-align: center; font-weight: 700; font-size: 16px; margin-bottom: 12px;">
                Approve Interviewer
              </a>
              <a href="${declineLink}" style="display: block; background: #fef2f2; color: #b91c1c; padding: 16px; border-radius: 12px; text-decoration: none; text-align: center; font-weight: 700; font-size: 16px;">
                Decline Request
              </a>
            </div>

            <p style="margin-top: 40px; color: #94a3b8; font-size: 12px; text-align: center;">
              This is an automated request from CodeHire. Once approved, the user will be notified and granted access to create sessions.
            </p>
          </div>
        </div>
      `,
    });

    console.log(`✅ Success: Approval email sent to admin for ${name}`);
    return { success: true };
  }
);

export const functions = [syncUser, deleteUserFromDB, sendApprovalEmail];
