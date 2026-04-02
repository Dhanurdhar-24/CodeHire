import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["participant", "interviewer"],
      default: "participant",
    },
    organization: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "participant";
      },
    },
    approvalToken: {
      type: String,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

const User = mongoose.model("User", userSchema);

export default User;
