import api from "@/lib/api";
import { Profile } from "@/types";

export const getProfile = async (): Promise<Profile> => {
  const response = await api.get("/profile");
  return response.data;
};

export const createProfile = async (
  data: Partial<Profile>
) => {
  const response = await api.post(
    "/profile",
    data
  );

  return response.data;
};

export const updateProfile = async (
  data: Partial<Profile>
) => {
  const response = await api.put(
    "/profile",
    data
  );

  return response.data;
};