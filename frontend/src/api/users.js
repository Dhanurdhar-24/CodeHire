import axiosInstance from "../lib/axios";

export const userApi = {
  convertToInterviewer: async (data) => {
    const response = await axiosInstance.patch("/users/convert", data);
    return response.data;
  },
};
