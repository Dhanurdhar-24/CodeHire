import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, canJoinCall) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // If session hasn't loaded yet, keep waiting
    if (loadingSession || !session) return;

    // Wait until user actually joined the session in DB
    if (!isHost && !canJoinCall) return;

    // If already initialized, don't re-initialize
    if (initialized.current) return;

    // If session has no callId, nothing to init
    if (!session?.callId) {
      setIsInitializingCall(false);
      return;
    }

    // If session is completed, no need to init
    if (session.status === "completed") {
      setIsInitializingCall(false);
      return;
    }

    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      try {
        setIsInitializingCall(true);
        initialized.current = true;

        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();
        console.log("Stream token fetched for:", userId);

        const client = await initializeStreamClient(
          { id: userId, name: userName, image: userImage },
          token
        );
        setStreamClient(client);

        videoCall = client.call("default", session.callId);
        await videoCall.join();
        setCall(videoCall);
        console.log("Joined video call:", session.callId);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          { id: userId, name: userName, image: userImage },
          token
        );
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);
        console.log("Connected to chat channel:", session.callId);
      } catch (error) {
        console.error("Stream initialization error:", error.message, error);
        toast.error("Failed to connect to video call: " + error.message);
        initialized.current = false; // allow retry
      } finally {
        setIsInitializingCall(false);
      }
    };

    initCall();

    return () => {
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session?.callId, loadingSession, isHost, canJoinCall, session?.status]);

  return { streamClient, call, chatClient, channel, isInitializingCall };
}

export default useStreamClient;
