import api from "@/lib/api";
import { Skill } from "@/types";

export const getSkills = async (): Promise<Skill[]> => {
  const response = await api.get("/skills");
  return response.data;
};

export const createSkill = async (skill: Omit<Skill, "id">) => {
  const response = await api.post("/skills", skill);
  return response.data;
};

export const updateSkill = async (
  id: number,
  skill: Partial<Skill>
) => {
  const response = await api.put(
    `/skills/${id}`,
    skill
  );

  return response.data;
};

export const deleteSkill = async (
  id: number
) => {
  const response = await api.delete(
    `/skills/${id}`
  );

  return response.data;
};