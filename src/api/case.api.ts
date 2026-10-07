import apiClient from "@/lib/apiClient";
import type {
  CaseActivity,
  CaseInvoice,
  CaseMessage,
  CaseParams,
  CaseReport,
  CaseStatus,
  CreateCaseActivityPayload,
  CreateCaseInvoicePayload,
  CreateCasePayload,
  CreateCaseReportPayload,
  CreateLawyerNotePayload,
  CreateLegalDocumentPayload,
  LegalCase,
  LegalDocument,
  LawyerNote,
  UpdateCasePayload,
  UpdateLawyerNotePayload,
  UpdateLegalDocumentPayload,
} from "@/types/case.type";
import type { UserRole } from "@/types/user.type";
import type { ApiResponse } from "@/types/api.type";

export type { CreateCasePayload } from "@/types/case.type";

function get<T>(path: string, params?: CaseParams) {
  return apiClient
    .get<ApiResponse<T>>(path, { params })
    .then(({ data }) => data);
}

function post<T>(path: string, body?: object) {
  return apiClient.post<ApiResponse<T>>(path, body).then(({ data }) => data);
}

function patch<T>(path: string, body?: object) {
  return apiClient.patch<ApiResponse<T>>(path, body).then(({ data }) => data);
}

function remove<T>(path: string) {
  return apiClient.delete<ApiResponse<T>>(path).then(({ data }) => data);
}

export const caseApi = {
  cases: (role: UserRole, params?: CaseParams) => {
    const path =
      role === "CLIENT"
        ? "/case/my-cases"
        : role === "LAWYER"
          ? "/case/lawyer-cases"
          : "/case/all-cases";
    return get<LegalCase[]>(path, params);
  },
  case: (id: string) => get<LegalCase>(`/case/${id}`),
  createCase: (body: CreateCasePayload) =>
    post<LegalCase>("/case/create-case", body),
  updateCase: (id: string, body: UpdateCasePayload) =>
    patch<LegalCase>(`/case/${id}`, body),
  updateCaseStatus: (id: string, status: CaseStatus) =>
    patch<LegalCase>(`/case/update-status/${id}`, { status }),
  assignCase: (id: string, lawyerId: string) =>
    patch<LegalCase>(`/case/assign-lawyer/${id}`, { lawyerId }),
  closeCase: (id: string) => patch<LegalCase>(`/case/close/${id}`, {}),
  deleteCase: (id: string) => remove<null>(`/case/${id}`),

  caseInvoices: (caseId: string) =>
    get<CaseInvoice[]>(`/invoice/case/${caseId}`),
  createCaseInvoice: (body: CreateCaseInvoicePayload) =>
    post<CaseInvoice>("/invoice/", body),

  caseDocuments: (caseId: string) =>
    get<LegalDocument[]>(`/legal-document/case/${caseId}`),
  documents: () => get<LegalDocument[]>("/legal-document/my-documents"),
  createCaseDocument: (caseId: string, body: CreateLegalDocumentPayload) =>
    post<LegalDocument>(`/legal-document/${caseId}`, body),
  updateCaseDocument: (id: string, body: UpdateLegalDocumentPayload) =>
    patch<LegalDocument>(`/legal-document/${id}`, body),
  deleteCaseDocument: (id: string) => remove<null>(`/legal-document/${id}`),

  messages: (caseId: string) => get<CaseMessage[]>(`/case-message/${caseId}`),
  sendMessage: (caseId: string, content: string) =>
    post<CaseMessage>(`/case-message/${caseId}`, { content }),
  deleteMessage: (id: string) => remove<null>(`/case-message/${id}`),
  activities: (caseId: string) =>
    get<CaseActivity[]>(`/case-activity/case/${caseId}`),
  createActivity: (
    caseId: string,
    body: CreateCaseActivityPayload,
  ) => post<CaseActivity>(`/case-activity/${caseId}`, body),

  reports: (params?: CaseParams) =>
    get<CaseReport[]>("/case-report/my-reports", params),
  caseReports: (caseId: string) =>
    get<CaseReport[]>(`/case-report/case/${caseId}`),
  createReport: (caseId: string, body: CreateCaseReportPayload) =>
    post<CaseReport>(`/case-report/${caseId}`, body),
  notes: (caseId: string) => get<LawyerNote[]>(`/lawyer-note/case/${caseId}`),
  createNote: (caseId: string, body: CreateLawyerNotePayload) =>
    post<LawyerNote>(`/lawyer-note/${caseId}`, body),
  updateNote: (id: string, body: UpdateLawyerNotePayload) =>
    patch<LawyerNote>(`/lawyer-note/${id}`, body),
  deleteNote: (id: string) => remove<null>(`/lawyer-note/${id}`),
};
