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

export const bulkDeleteTestimonials = async (ids: number[]) => {
  const response = await api.post("/testimonials/bulk-delete", { ids });
  return response.data;
};

export const bulkPublishTestimonials = async (ids: number[]) => {
  const response = await api.patch("/testimonials/bulk-publish", { ids });
  return response.data;
};

export const bulkUnpublishTestimonials = async (ids: number[]) => {
  const response = await api.patch("/testimonials/bulk-unpublish", { ids });
  return response.data;
};
