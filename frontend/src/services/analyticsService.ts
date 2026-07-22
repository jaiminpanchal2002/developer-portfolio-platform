import api from "@/lib/api";

export interface AnalyticsSummary {
  totalViews: number;
  views30d: number;
  views7d: number;
  uniqueVisitors30d: number;
  deviceBreakdown: Record<string, number>;
  topPages: Record<string, number>;
  topReferrers: Record<string, number>;
  /** ISO date -> views, oldest first, zero-filled */
  dailyViews14d: Record<string, number>;
}

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await api.get("/analytics/summary");
  return response.data;
};
