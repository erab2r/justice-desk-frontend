import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api.type";
import type {
  ApproveLawyerPayload,
  Lawyer,
  LawyerParams,
  PublicLawyerParams,
  PublicLawyerProfile,
  UpdateLawyerProfilePayload,
} from "@/types/lawyer.type";
import type {
  LawyerApplicationPayload,
  VerifyAccountPayload,
} from "@/types/auth.type";

export function applyAsLawyer(payload: LawyerApplicationPayload) {
  const formData = new FormData();
  formData.append("user", JSON.stringify(payload.user));
  formData.append("lawyer", JSON.stringify(payload.lawyer));
  if (payload.resume) {
    formData.append("resume", payload.resume);
  }

  for (const file of payload.additionalFiles ?? []) {
    formData.append("additionalFiles", file);
  }

  return apiClient
    .post<ApiResponse<unknown>>("/lawyer/apply-lw", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(({ data }) => data);
}

export function verifyLawyerAccount(payload: VerifyAccountPayload) {
  return apiClient
    .post<ApiResponse<unknown>>("/lawyer/verify-email", payload)
    .then(({ data }) => data);
}

export function getAllLawyers(params: LawyerParams) {
  return apiClient
    .get<ApiResponse<Lawyer[]>>("/lawyer/all-lawyers", { params })
    .then(({ data }) => data);
}

export function approveLawyer(payload: ApproveLawyerPayload) {
  return apiClient
    .patch<ApiResponse<Lawyer>>("/lawyer/approve-lw", payload)
    .then(({ data }) => data);
}

export function updateLawyerProfile(payload: UpdateLawyerProfilePayload) {
  return apiClient
    .patch<ApiResponse<Lawyer>>("/lawyer/profile", payload)
    .then(({ data }) => data);
}

export function getAllPublicLawyers(params: PublicLawyerParams) {
  return apiClient
    .get<ApiResponse<PublicLawyerProfile[]>>("/lawyer/all-lw", { params })
    .then(({ data }) => data);
}

export function getPublicLawyerProfile(lawyerId: string) {
  return apiClient
    .get<ApiResponse<PublicLawyerProfile>>(`/lawyer/${lawyerId}`)
    .then(({ data }) => data);
}
