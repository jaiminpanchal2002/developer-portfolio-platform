import api from "@/lib/api";

export const getInquiries = async () => {
  const response = await api.get("/contact-inquiries");
  return response.data;
};

export const markInquiryAsRead = async (id: number) => {
  const response = await api.put(`/contact-inquiries/${id}/read`);
  return response.data;
};

export const deleteInquiry = async (id: number) => {
  const response = await api.delete(`/contact-inquiries/${id}`);
  return response.data;
};

export const bulkDeleteInquiries = async (ids: number[]) => {
  const response = await api.post("/contact-inquiries/bulk-delete", { ids });
  return response.data;
};

export const bulkMarkInquiriesAsRead = async (ids: number[]) => {
  const response = await api.patch("/contact-inquiries/bulk-read", { ids });
  return response.data;
};
