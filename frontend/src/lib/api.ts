import axios from "axios";

// Configure api client with dynamic baseURL and automatic '/api' suffix enforcement
const getBaseURL = () => {
  let url = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  
  // Strip trailing slash if present
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  
  // Force /api suffix if not already present
  if (!url.endsWith("/api")) {
    url = url + "/api";
  }
  
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
});





api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  
  // Clean up any legacy double slashes or odd formats
  let cleanedUrl = url.trim();

  // Handle blob or base64 data URLs directly
  if (cleanedUrl.startsWith("blob:") || cleanedUrl.startsWith("data:")) {
    return cleanedUrl;
  }

  // If the URL is absolute (http:// or https://)
  if (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")) {
    if (cleanedUrl.includes("localhost:8080")) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      // Remove '/api' from base URL if it's there, as static files are served from the root context
      const hostUrl = backendUrl.endsWith("/api") ? backendUrl.slice(0, -4) : backendUrl;
      return cleanedUrl.replace("http://localhost:8080", hostUrl);
    }
    return cleanedUrl;
  }
  
  // If the URL is relative (e.g. /uploads/...)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const hostUrl = backendUrl.endsWith("/api") ? backendUrl.slice(0, -4) : backendUrl;
  
  // Format hostUrl and path correctly
  const cleanHost = hostUrl.endsWith("/") ? hostUrl.slice(0, -1) : hostUrl;
  const cleanPath = cleanedUrl.startsWith("/") ? cleanedUrl : `/${cleanedUrl}`;
  
  return `${cleanHost}${cleanPath}`;
};

export default api;