import api from "@/lib/api";

export interface JobApplicationPayload {
  jobTitle: string;
  company: string;
  status: string;
  appliedDate: string;
  jobUrl?: string;
  interviewDate?: string;
  notes?: string;
}


export const getApplications = async () => {
  const response = await api.get("/applications");
  return response.data;
};

export const getApplicationById = async (id: number) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};

export const createApplication = async (data: JobApplicationPayload) => {
  const response = await api.post("/applications", data);
  return response.data;
};

export const updateApplication = async (id: number, data: JobApplicationPayload) => {
  const response = await api.put(`/applications/${id}`, data);
  return response.data;
};

export const deleteApplication = async (id: number) => {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
};
