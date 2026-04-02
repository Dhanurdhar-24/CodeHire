import { chatClient, streamClient, upsertStreamUser } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty, isCustom, customDescription } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;
    const userRole = req.user.role;
    const isApproved = req.user.isApproved;

    if (userRole !== "interviewer") {
      return res.status(403).json({ message: "Only interviewers can create sessions" });
    }

    if (!isApproved) {
      return res.status(403).json({ message: "Your account is pending approval. Please wait for the admin to verify you." });
    }

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    if (isCustom && !customDescription) {
      return res.status(400).json({ message: "Custom description is required for custom problems" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db
    const session = await Session.create({ 
      problems: [{ problem, difficulty, isCustom, customDescription }], 
      host: userId, 
      callId,
      currentProblemIndex: 0 
    });

    // 0. Ensure user is synced with Stream
    await upsertStreamUser({
      id: clerkId,
      name: req.user.name,
      image: req.user.profileImage,
    });

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session });
  } catch (error) {
    console.error("--- SESSION CREATION ERROR ---");
    console.error("Message:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
    console.error("Stack:", error.stack);
    console.error("------------------------------");
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

export async function getActiveSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "active",
      $or: [{ host: userId }, { participant: userId }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // check if session is already full - has a participant
    if (session.participant) return res.status(409).json({ message: "Session is full" });

    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // delete stream video call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    // delete stream chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function addProblemToSession(req, res) {
  try {
    const { id } = req.params;
    const { problem, difficulty, isCustom, customDescription } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can add problems" });
    }

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    session.problems.push({ problem, difficulty, isCustom, customDescription });
    // auto-switch to the new problem
    session.currentProblemIndex = session.problems.length - 1;
    await session.save();

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in addProblemToSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function switchProblem(req, res) {
  try {
    const { id } = req.params;
    const { index } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can switch problems" });
    }

    if (index < 0 || index >= session.problems.length) {
      return res.status(400).json({ message: "Invalid problem index" });
    }

    session.currentProblemIndex = index;
    await session.save();

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in switchProblem controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
