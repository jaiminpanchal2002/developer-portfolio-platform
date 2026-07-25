import api from "@/lib/api";

export const getJobs = async (country: string = "in", keyword: string = "Laravel Developer", remote: boolean = false) => {
  const response = await api.get("/jobs/search", {
    params: {
      keyword,
      country,
      remote,
    },
  });
  return response.data;
};