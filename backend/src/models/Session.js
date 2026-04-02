import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problems: [
      {
        problem: {
          type: String,
          required: true,
        },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          required: true,
        },
        isCustom: {
          type: Boolean,
          default: false,
        },
        customDescription: {
          type: String,
          default: "",
        },
      },
    ],
    currentProblemIndex: {
      type: Number,
      default: 0,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    // stream video call ID
    callId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
