import type { AxiosResponse } from "axios";
import apiClient, { setAccessToken } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api.type";
import type {
  LoginPayload,
  RegistrationPayload,
  VerifyAccountPayload,
} from "@/types/auth.type";
import type { CurrentUser, UserRole } from "@/types/user.type";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const userRoles: readonly UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "LAWYER",
  "CLIENT",
];

function rememberAccessToken<T extends AuthTokens>(
  response: AxiosResponse<ApiResponse<T>>,
) {
  const { accessToken } = response.data.data;
  if (!accessToken) {
    throw new Error("Authentication response did not include an access token.");
  }
  setAccessToken(accessToken);
  return response.data;
}

export function userLogin(payload: LoginPayload) {
  return apiClient
    .post<ApiResponse<AuthTokens>>("/auth/login", payload)
    .then(rememberAccessToken);
}

export function verifyAccount(payload: VerifyAccountPayload) {
  return apiClient
    .post<ApiResponse<AuthTokens & { user: CurrentUser }>>(
      "/auth/verify-email",
      payload,
    )
    .then(rememberAccessToken);
}

export function userRegistration(payload: RegistrationPayload) {
  const request = { ...payload };
  delete request.confirmPassword;
  return apiClient
    .post<ApiResponse<unknown>>("/auth/register", request)
    .then(({ data }) => data);
}

export function userLogout() {
  return apiClient.post<ApiResponse<null>>("/auth/logout").then(({ data }) => {
    setAccessToken(null);
    return data;
  });
}

export function getMe() {
  return apiClient
    .get<ApiResponse<CurrentUser>>("/auth/me")
    .then(({ data }) => {
      const user = data.data;
      if (!user || !userRoles.includes(user.role)) {
        throw new Error("The authenticated account has an invalid role.");
      }
      return user;
    });
}

export function googleOAuth(payload: { idToken: string }) {
  return apiClient
    .post<ApiResponse<AuthTokens>>("/auth/google", payload)
    .then(rememberAccessToken);
}

export function requestPasswordReset(email: string) {
  return apiClient
    .post<ApiResponse<null>>("/auth/forgot-password", { email })
    .then(({ data }) => data);
}

export function resetPassword(payload: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  return apiClient
    .post<ApiResponse<null>>("/auth/reset-password", payload)
    .then(({ data }) => data);
}
