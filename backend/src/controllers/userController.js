import User from "../models/User.js";
import { clerkClient } from "@clerk/express";
import { inngest } from "../lib/inngest.js";

export const convertToInterviewer = async (req, res) => {
  try {
    const { organization } = req.body;
    const clerkId = req.user.clerkId;

    if (!organization) {
      return res.status(400).json({ message: "Organization name is required" });
    }

    if (req.user.role === "interviewer") {
      return res.status(400).json({ message: "You are already an interviewer" });
    }

    const approvalToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // 1. Update DB
    const user = await User.findOneAndUpdate(
      { clerkId },
      { 
        role: "interviewer", 
        organization, 
        isApproved: false, 
        approvalToken 
      },
      { new: true }
    );

    // 2. Update Clerk Metadata
    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: "interviewer",
        isApproved: false,
      },
    });

    // 3. Notify Admin (Real Email)
    await inngest.send({
      name: "email/send-approval",
      data: {
        clerkId,
        email: user.email,
        name: user.name,
        organization: user.organization,
        approvalToken,
      },
    });

    console.log(`✅ Success: Conversion approval request sent for ${user.name}`);

    res.status(200).json({ 
      message: "Request submitted! Please wait for admin approval.",
      user 
    });
  } catch (error) {
    console.error("Error in convertToInterviewer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
