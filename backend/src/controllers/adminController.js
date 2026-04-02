import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

export async function approveUser(req, res) {
  try {
    const { clerkId, token } = req.query;

    if (!clerkId || !token) {
      return res.status(400).json({ message: "Clerk ID and Token are required" });
    }

    const user = await User.findOne({ clerkId, approvalToken: token });

    if (!user) {
      return res.status(404).json({ message: "User not found or invalid token" });
    }

    user.isApproved = true;
    user.approvalToken = null; // clear the token after approval
    await user.save();

    // sync to clerk public metadata
    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        isApproved: true,
      },
    });

    res.status(200).send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f0fdf4;">
          <div style="text-align: center; border: 1px solid #bbf7d0; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h1 style="color: #166534;">Success!</h1>
            <p>Interviewer <strong>${user.name}</strong> from <strong>${user.organization}</strong> has been approved.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error in approveUser:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function declineUser(req, res) {
  try {
    const { clerkId, token } = req.query;

    if (!clerkId || !token) {
      return res.status(400).json({ message: "Clerk ID and Token are required" });
    }

    const user = await User.findOne({ clerkId, approvalToken: token });

    if (!user) {
      return res.status(404).json({ message: "User not found or invalid token" });
    }

    // We can either delete or mark as declined. Let's delete to keep DB clean for now.
    await User.deleteOne({ _id: user._id });

    res.status(200).send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #fef2f2;">
          <div style="text-align: center; border: 1px solid #fecaca; background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h1 style="color: #991b1b;">Declined</h1>
            <p>Registration for <strong>${user.name}</strong> has been declined and removed.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error in declineUser:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
