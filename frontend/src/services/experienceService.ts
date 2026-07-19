import api from "@/lib/api";
import { Experience } from "@/types";

export const getExperiences = async (): Promise<Experience[]> => {
  const response = await api.get("/experiences");
  return response.data;
};

export const createExperience = async (data: Omit<Experience, "id">) => {
  const response = await api.post("/experiences", data);
  return response.data;
};

export const updateExperience = async (
  id: number,
  data: Partial<Experience>
) => {
  const response = await api.put(
    `/experiences/${id}`,
    data
  );

  return response.data;
};

export const deleteExperience = async (id: number) => {
  const response = await api.delete(
    `/experiences/${id}`
  );

  return response.data;
};