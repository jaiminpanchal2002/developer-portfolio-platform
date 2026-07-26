import api from "@/lib/api";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export const sendChatMessage = async (message: string, history: ChatMessage[]) => {
  const response = await api.post("/public/chat", { message, history });
  return response.data as { reply: string };
};
