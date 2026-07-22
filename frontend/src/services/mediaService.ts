import api from "@/lib/api";

export interface MediaFile {
  name: string;
  url: string;
  sizeBytes: number;
  modifiedAt: string;
  image: boolean;
}

export const getMediaFiles = async (): Promise<MediaFile[]> => {
  const response = await api.get("/media");
  return response.data;
};

export const deleteMediaFile = async (name: string) => {
  const response = await api.delete("/media", { params: { name } });
  return response.data;
};
