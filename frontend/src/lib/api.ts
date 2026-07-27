import axios from "axios";
import Swal from "sweetalert2";

// Configure api client with dynamic baseURL and automatic '/api' suffix enforcement
const getBaseURL = () => {
  let url = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  
  url = url.trim();
  
  // Enforce protocol prefix to prevent browsers from treating bare domain names as relative paths
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  
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





/** Decodes a JWT's `exp` claim (seconds since epoch) without a library — it's just base64. */
function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

const REFRESH_MARGIN_MS = 2 * 60 * 1000;
let refreshPromise: Promise<string | null> | null = null;

/** Proactively renews the token when it's near expiry, so the first mutating
 *  request after a period of idle/typing time isn't the one that discovers
 *  the session went stale. Coalesced so concurrent requests share one call. */
async function ensureFreshToken(token: string): Promise<string> {
  const expiryMs = getTokenExpiryMs(token);
  if (expiryMs === null || expiryMs - Date.now() > REFRESH_MARGIN_MS) {
    return token;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${getBaseURL()}/auth/refresh`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const newToken = res.data?.token as string | undefined;
        if (newToken) {
          localStorage.setItem("token", newToken);
          return newToken;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  const refreshed = await refreshPromise;
  return refreshed ?? token;
}

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      if (window.location.pathname.startsWith("/admin")) {
        token = await ensureFreshToken(token);
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    const savedLocale = localStorage.getItem("portfolio_locale") || "en";
    config.headers["Accept-Language"] = savedLocale;
  } else {
    config.headers["Accept-Language"] = "en";
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = genuinely unauthenticated (missing/invalid/expired token) — the
    // one case that means "please sign in again". 403 means the request was
    // rejected for another reason and must not bounce the admin out of a
    // page they're actively working on; let the caller show its own error.
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        localStorage.removeItem("token");
        Swal.fire({
          icon: "info",
          title: "Session expired",
          text: "Please sign in again to continue.",
          confirmButtonColor: "#d4af37",
        }).then(() => {
          window.location.href = "/login";
        });
      }
    }
    return Promise.reject(error);
  }
);

const isLocalHost = (value: string) => /^https?:\/\/(localhost|127\.0\.0\.1)/.test(value);

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  // Clean up any legacy double slashes or odd formats
  const cleanedUrl = url.trim();

  // Handle blob or base64 data URLs directly
  if (cleanedUrl.startsWith("blob:") || cleanedUrl.startsWith("data:")) {
    return cleanedUrl;
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  let hostUrl = backendUrl.endsWith("/api") ? backendUrl.slice(0, -4) : backendUrl;

  // Prefer HTTPS for any real (non-localhost) host. This must not depend on
  // `window`/`document.location` — this function also runs during server
  // rendering, and a server/client mismatch here can crash the render.
  if (hostUrl.startsWith("http://") && !isLocalHost(hostUrl)) {
    hostUrl = hostUrl.replace("http://", "https://");
  }

  let resolved: string;

  // If the URL is absolute (http:// or https://)
  if (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")) {
    if (cleanedUrl.includes("localhost:8080")) {
      resolved = cleanedUrl.replace("http://localhost:8080", hostUrl);
    } else if (!isLocalHost(cleanedUrl)) {
      resolved = cleanedUrl.replace(/^http:\/\//, "https://");
    } else {
      resolved = cleanedUrl;
    }
  } else {
    // If the URL is relative (e.g. /uploads/...)
    // Format hostUrl and path correctly
    const cleanHost = hostUrl.endsWith("/") ? hostUrl.slice(0, -1) : hostUrl;
    const cleanPath = cleanedUrl.startsWith("/") ? cleanedUrl : `/${cleanedUrl}`;
    resolved = `${cleanHost}${cleanPath}`;
  }

  // Encode spaces/special characters (e.g. uploaded filenames with spaces)
  // that strict URL consumers like next/image reject outright.
  return encodeURI(resolved);
};

export default api;