import api from "@/lib/api";
import { Education } from "@/types";

export const getEducations = async (): Promise<Education[]> => {
  const response = await api.get("/educations");
  return response.data;
};

export const createEducation = async (data: Omit<Education, "id">) => {
  const response = await api.post("/educations", data);
  return response.data;
};

export const updateEducation = async (
  id: number,
  data: Partial<Education>
) => {
  const response = await api.put(
    `/educations/${id}`,
    data
  );

  return response.data;
};

export const deleteEducation = async (
  id: number
) => {
  const response = await api.delete(
    `/educations/${id}`
  );

  return response.data;
};