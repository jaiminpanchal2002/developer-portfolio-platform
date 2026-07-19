import api from "@/lib/api";
import { Certificate } from "@/types";

export const getCertificates = async (): Promise<Certificate[]> => {
  const response = await api.get("/certificates");
  return response.data;
};

export const createCertificate = async (data: Omit<Certificate, "id">) => {
  const response = await api.post("/certificates", data);
  return response.data;
};

export const updateCertificate = async (
  id: number,
  data: Partial<Certificate>
) => {
  const response = await api.put(
    `/certificates/${id}`,
    data
  );

  return response.data;
};

export const deleteCertificate = async (
  id: number
) => {
  const response = await api.delete(
    `/certificates/${id}`
  );

  return response.data;
};