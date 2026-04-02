import { clerkClient, requireAuth } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";
import { inngest } from "../lib/inngest.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      // if user not found in db, try to sync from clerk (lazy sync)
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        // publicMetadata is set by admin approval; unsafeMetadata is set on signup
        const pubMeta = clerkUser.publicMetadata || {};
        const unsafeMeta = clerkUser.unsafeMetadata || {};
        const role = pubMeta.role || unsafeMeta.role || "participant";
        const isApproved = pubMeta.isApproved !== undefined ? pubMeta.isApproved : (role === "participant");
        const organization = unsafeMeta.organization || "";
        const approvalToken = (role === "interviewer" && !isApproved)
          ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
          : null;

        user = await User.findOneAndUpdate(
          { clerkId },
          {
            $set: {
              clerkId,
              name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Unknown",
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

        // if interviewer, notify admin (even without webhook)
        if (role === "interviewer") {
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
          console.log(`Lazy sync triggered approval email for: ${user.name}`);
        }

        // sync to stream as well
        await upsertStreamUser({
          id: user.clerkId,
          name: user.name,
          image: user.profileImage,
        });

        console.log("Lazy sync successful for user:", clerkId);
      }

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
