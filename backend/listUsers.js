import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const UserSchema = new mongoose.Schema({
  clerkId: String,
  email: String,
  isApproved: Boolean,
  role: String,
  name: String,
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

const listAll = async () => {
  await mongoose.connect(process.env.DB_URL);
  console.log("✅ Connected to MongoDB.\n");

  const users = await User.find({}).select("name email role isApproved clerkId createdAt");
  
  if (users.length === 0) {
    console.log("⚠️  NO USERS FOUND IN DATABASE.");
    console.log("    This means the production backend has never synced any user.");
    console.log("    Fix: Make sure you've logged into the VERCEL deployment at least once.");
  } else {
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((u, i) => {
      console.log(`--- User ${i + 1} ---`);
      console.log(`  Name:       ${u.name}`);
      console.log(`  Email:      ${u.email}`);
      console.log(`  ClerkId:    ${u.clerkId}`);
      console.log(`  Role:       ${u.role}`);
      console.log(`  isApproved: ${u.isApproved}`);
      console.log(`  Created:    ${u.createdAt}`);
    });
  }
  process.exit(0);
};

listAll().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
