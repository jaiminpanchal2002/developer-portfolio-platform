import api from "@/lib/api";
import { Project } from "@/types";

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get("/projects");
  return response.data;
};

export const createProject = async (project: Omit<Project, "id">) => {
  const response = await api.post("/projects", project);
  return response.data;
};

export const updateProject = async (
  id: number,
  project: Partial<Project>
) => {
  const response = await api.put(
    `/projects/${id}`,
    project
  );

  return response.data;
};

export const deleteProject = async (
  id: number
) => {
  return api.delete(`/projects/${id}`);
};