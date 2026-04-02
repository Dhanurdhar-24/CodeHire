import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { clerkClient } from "@clerk/express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const UserSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
  isApproved: Boolean,
  role: String,
  approvalToken: String,
  name: String,
  profileImage: String,
  organization: String,
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

const diagnose = async (email) => {
  await mongoose.connect(process.env.DB_URL);
  console.log("✅ Connected to MongoDB.");

  const user = await User.findOne({ email });

  if (!user) {
    console.log(`❌ No user found with email: ${email}`);
    console.log("   This means the user has never logged into the PRODUCTION site.");
    console.log("   Fix: Log in to the Vercel site once, then run this script again.");
  } else {
    console.log("\n📋 User found in MongoDB:");
    console.log(`   Name:       ${user.name}`);
    console.log(`   Email:      ${user.email}`);
    console.log(`   Role:       ${user.role}`);
    console.log(`   isApproved: ${user.isApproved}`);
    console.log(`   ClerkId:    ${user.clerkId}`);
    
    if (user.role !== "interviewer" || !user.isApproved) {
      console.log("\n🔧 Fixing: Approving user as interviewer...");
      user.role = "interviewer";
      user.isApproved = true;
      user.approvalToken = null;
      await user.save();
      
      await clerkClient.users.updateUserMetadata(user.clerkId, {
        publicMetadata: { role: "interviewer", isApproved: true },
      });
      console.log("✅ User approved in both MongoDB and Clerk!");
    } else {
      console.log("\n✅ User is already approved as interviewer in MongoDB.");
      console.log("🔧 Re-syncing Clerk metadata just in case...");
      await clerkClient.users.updateUserMetadata(user.clerkId, {
        publicMetadata: { role: "interviewer", isApproved: true },
      });
      console.log("✅ Clerk metadata refreshed!");
    }
  }
  process.exit(0);
};

diagnose("dhanurdharyadav62@gmail.com").catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
