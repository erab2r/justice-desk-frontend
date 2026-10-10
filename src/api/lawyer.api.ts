import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api.type";
import type {
  LawyerApplicationPayload,
  VerifyAccountPayload,
} from "@/types/auth.type";
import type {
  ApproveLawyerPayload,
  Lawyer,
  LawyerDocuments,
  LawyerDocumentType,
  LawyerParams,
  PublicLawyerParams,
  PublicLawyerProfile,
  UpdateLawyerProfilePayload,
  UpdateLawyerStatusPayload,
} from "@/types/lawyer.type";

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

export function updateManagedLawyerProfile(
  lawyerId: string,
  payload: UpdateLawyerProfilePayload,
) {
  return apiClient
    .patch<ApiResponse<Lawyer>>(`/lawyer/${lawyerId}/profile`, payload)
    .then(({ data }) => data);
}

export function updateLawyerStatus(
  lawyerId: string,
  payload: UpdateLawyerStatusPayload,
) {
  return apiClient
    .patch<ApiResponse<unknown>>(`/lawyer/${lawyerId}/status`, payload)
    .then(({ data }) => data);
}

export function suspendLawyer(lawyerId: string, suspended: boolean) {
  return apiClient
    .patch<ApiResponse<unknown>>(`/lawyer/${lawyerId}/suspension`, {
      suspended,
    })
    .then(({ data }) => data);
}

export function deleteLawyer(lawyerId: string) {
  return apiClient
    .delete<ApiResponse<null>>(`/lawyer/${lawyerId}`)
    .then(({ data }) => data);
}

export function getLawyerDocuments(lawyerId: string) {
  return apiClient
    .get<ApiResponse<LawyerDocuments>>(`/lawyer/${lawyerId}/documents`)
    .then(({ data }) => data);
}

export function updateLawyerDocuments(lawyerId: string, formData: FormData) {
  return apiClient
    .patch<ApiResponse<LawyerDocuments>>(
      `/lawyer/${lawyerId}/documents`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
    .then(({ data }) => data);
}

export function deleteLawyerDocument(
  lawyerId: string,
  payload: { documentType: LawyerDocumentType; publicId?: string },
) {
  return apiClient
    .delete<ApiResponse<LawyerDocuments>>(`/lawyer/${lawyerId}/documents`, {
      data: payload,
    })
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
