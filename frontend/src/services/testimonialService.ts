import api from "@/lib/api";
import { Testimonial } from "@/types";

/** Public: published testimonials only. */
export const getTestimonials = async (): Promise<Testimonial[]> => {
  const response = await api.get("/testimonials");
  return response.data;
};

/** Admin listing: includes drafts. Requires an authenticated session. */
export const getAdminTestimonials = async (): Promise<Testimonial[]> => {
  const response = await api.get("/testimonials/admin/all");
  return response.data;
};

export const createTestimonial = async (
  testimonial: Omit<Testimonial, "id">
) => {
  const response = await api.post("/testimonials", testimonial);
  return response.data;
};

export const updateTestimonial = async (
  id: number,
  testimonial: Partial<Testimonial>
) => {
  const response = await api.put(`/testimonials/${id}`, testimonial);
  return response.data;
};

export const deleteTestimonial = async (id: number) => {
  return api.delete(`/testimonials/${id}`);
};
