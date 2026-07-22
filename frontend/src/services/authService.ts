import api from "@/lib/api";

export interface LoginResponse {
  token?: string;
  message?: string;
  twoFactorRequired?: boolean;
}

export const login = async (data: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

/** Second login step when 2FA is enabled: email + TOTP code -> token. */
export const verifyTwoFactor = async (
  email: string,
  code: string
): Promise<LoginResponse> => {
  const response = await api.post("/auth/2fa/verify", { email, code });
  return response.data;
};

// ── Authenticated 2FA management (admin) ──────────────────────────────
export const getTwoFactorStatus = async (): Promise<{ enabled: boolean }> => {
  const response = await api.get("/2fa/status");
  return response.data;
};

export const setupTwoFactor = async (): Promise<{
  secret: string;
  otpauthUrl: string;
}> => {
  const response = await api.post("/2fa/setup");
  return response.data;
};

export const enableTwoFactor = async (code: string) => {
  const response = await api.post("/2fa/enable", { code });
  return response.data;
};

export const disableTwoFactor = async (code: string) => {
  const response = await api.post("/2fa/disable", { code });
  return response.data;
};

export const register = async (data: {
  fullName: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};