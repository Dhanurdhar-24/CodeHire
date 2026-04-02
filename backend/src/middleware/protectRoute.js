import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";
import { inngest } from "../lib/inngest.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Step 1: Get auth from Clerk
    const auth = getAuth(req);
    const clerkId = auth?.userId;

    console.log("protectRoute: clerkId =", clerkId);

    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized - not logged in" });
    }

    // Step 2: Find or create user in MongoDB
    let user = await User.findOne({ clerkId });
    console.log("protectRoute: user found in DB =", !!user);

    if (!user) {
      console.log("protectRoute: lazy syncing user from Clerk...");
      const clerkUser = await clerkClient.users.getUser(clerkId);

      // Read from publicMetadata (admin-approved) first, then unsafeMetadata (signup)
      const pubMeta = clerkUser.publicMetadata || {};
      const unsafeMeta = clerkUser.unsafeMetadata || {};
      const role = pubMeta.role || unsafeMeta.role || "participant";
      const isApproved =
        pubMeta.isApproved !== undefined
          ? pubMeta.isApproved
          : role === "participant";
      const organization = unsafeMeta.organization || "";
      const approvalToken =
        role === "interviewer" && !isApproved
          ? Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
          : null;

      user = await User.findOneAndUpdate(
        { clerkId },
        {
          $set: {
            clerkId,
            name:
              `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
              "Unknown",
            email: clerkUser.emailAddresses[0]?.emailAddress,
            profileImage: clerkUser.imageUrl,
            role,
            organization,
            isApproved,
            approvalToken,
          },
        },
        { upsert: true, new: true }
      );

      console.log("protectRoute: lazy sync done. role =", role, "isApproved =", isApproved);

      // sync to stream
      await upsertStreamUser({
        id: user.clerkId,
        name: user.name,
        image: user.profileImage,
      });

      // send approval email if new interviewer
      if (role === "interviewer" && approvalToken) {
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
      }
    }

    // Step 3: Attach user to request
    req.user = user;
    console.log("protectRoute: req.user._id =", user._id);
    next();
  } catch (error) {
    console.error("protectRoute error:", error.message, error.stack);
    res.status(500).json({ message: "Auth middleware error: " + error.message });
  }
};
