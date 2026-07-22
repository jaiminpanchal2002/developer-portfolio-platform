import api from "@/lib/api";
import { BlogPost } from "@/types";

/** Public list: published posts only, newest first. */
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const response = await api.get("/blog");
  return response.data;
};

/** Public single post by slug (drafts reachable by direct link for preview). */
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost> => {
  const response = await api.get(`/blog/slug/${encodeURIComponent(slug)}`);
  return response.data;
};

/** Admin listing: includes drafts. Requires an authenticated session. */
export const getAdminBlogPosts = async (): Promise<BlogPost[]> => {
  const response = await api.get("/blog/admin/all");
  return response.data;
};

export const createBlogPost = async (post: Partial<BlogPost>) => {
  const response = await api.post("/blog", post);
  return response.data;
};

export const updateBlogPost = async (id: number, post: Partial<BlogPost>) => {
  const response = await api.put(`/blog/${id}`, post);
  return response.data;
};

export const deleteBlogPost = async (id: number) => {
  return api.delete(`/blog/${id}`);
};
