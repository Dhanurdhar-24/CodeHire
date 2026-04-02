import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userApi } from "../api/users";
import { useUser } from "@clerk/clerk-react";

export const useConvertToInterviewer = () => {
  const { user } = useUser();

  const result = useMutation({
    mutationKey: ["convertToInterviewer"],
    mutationFn: userApi.convertToInterviewer,
    onSuccess: async () => {
      toast.success("Request submitted! Please wait for admin approval.");
      // optionally refresh clerk user profile to sync updated metadata
      if (user) await user.reload(); 
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit request");
    },
  });

  return result;
};
