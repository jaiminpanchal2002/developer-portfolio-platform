import api from "@/lib/api";

export interface DashboardStats {
  projects: number;
  skills: number;
  experiences: number;
  educations: number;
  certificates: number;
  applications: number;
  profileScore: number;
  atsScore: number;
  testimonials: number;
  blogPosts: number;
  unreadMessages: number;
  chatbotInteractions30d: number;
  pendingAppointments: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};
