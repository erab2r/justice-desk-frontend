import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError, ApiResponse } from "@/types/api.type";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const API_BASE_URL = `${apiOrigin ?? ""}/api/v1`;

const accessTokenStorageKey = "justice-desk.access-token";

function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(accessTokenStorageKey);
  } catch {
    return null;
  }
}

let accessToken: string | null = null;
let refreshRequest: Promise<string> | null = null;

accessToken = getStoredAccessToken();

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  accessToken = token;
  try {
    if (token) {
      window.sessionStorage.setItem(accessTokenStorageKey, token);
    } else {
      window.sessionStorage.removeItem(accessTokenStorageKey);
    }
  } catch {
    // Keep the in-memory session usable when browser storage is unavailable.
  }
}

export function clearAccessToken() {
  accessToken = null;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(accessTokenStorageKey);
  } catch {
    // Storage may be disabled by the browser.
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const request = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const url = request?.url ?? "";

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      url.includes("/auth/login") ||
      url.includes("/auth/google") ||
      url.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      refreshRequest ??= axios
        .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${API_BASE_URL}/auth/refresh-token`,
          undefined,
          { withCredentials: true },
        )
        .then(({ data }) => {
          const token = data.data.accessToken;
          setAccessToken(token);
          return token;
        })
        .finally(() => {
          refreshRequest = null;
        });

      const token = await refreshRequest;
      request.headers.set("Authorization", `Bearer ${token}`);
      return apiClient(request);
    } catch {
      clearAccessToken();
      return Promise.reject(error);
    }
  },
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export default apiClient;
