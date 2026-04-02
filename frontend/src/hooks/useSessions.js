import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
  const result = useMutation({
    mutationKey: ["createSession"],
    mutationFn: sessionApi.createSession,
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || "Failed to create room";
      console.error("Create room error:", error);
      toast.error(msg);
    },
  });

  return result;
};

export const useActiveSessions = () => {
  const result = useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
  });

  return result;
};

export const useMyRecentSessions = () => {
  const result = useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });

  return result;
};

export const useSessionById = (id) => {
  const result = useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: 5000, // refetch every 5 seconds to detect session status changes
  });

  return result;
};

export const useJoinSession = () => {
  const result = useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
    onSuccess: () => toast.success("Joined session successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to join session"),
  });

  return result;
};

export const useEndSession = () => {
  const result = useMutation({
    mutationKey: ["endSession"],
    mutationFn: sessionApi.endSession,
    onSuccess: () => toast.success("Session ended successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to end session"),
  });

  return result;
};

export const useAddProblemToSession = () => {
  const result = useMutation({
    mutationKey: ["addProblem"],
    mutationFn: ({ id, data }) => sessionApi.addProblemToSession(id, data),
    onSuccess: () => toast.success("New problem added!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to add problem"),
  });

  return result;
};

export const useSwitchProblem = () => {
  const result = useMutation({
    mutationKey: ["switchProblem"],
    mutationFn: ({ id, index }) => sessionApi.switchProblem(id, index),
    onSuccess: () => toast.success("Switched problem"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to switch problem"),
  });

  return result;
};
