import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { caseApi } from "@/api/case.api";
import type {
  CaseActivity,
  CaseParams,
  CasePriority,
  CaseStatus,
  CreateCaseActivityPayload,
  CreateCaseInvoicePayload,
  CreateCasePayload,
  CreateLawyerNotePayload,
  CreateLegalDocumentPayload,
  LegalCase,
  UpdateCasePayload,
} from "@/types/case.type";
import type { UserRole } from "@/types/user.type";
import { useGetPublicLawyers } from "@/hooks/lawyer.hook";

function invalidateCaseLists(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["cases"] });
  void queryClient.invalidateQueries({ queryKey: ["overview-cases"] });
}

export function useCases(
  role: UserRole,
  params?: CaseParams,
  queryKey: readonly unknown[] = ["cases", role],
) {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => caseApi.cases(role, params),
  });
}

export function useCaseLawyerOptions(enabled = true) {
  return useGetPublicLawyers({ page: 1, limit: 100 }, enabled);
}

export function useCase(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: () => caseApi.case(caseId),
    enabled: Boolean(caseId),
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCasePayload) => caseApi.createCase(payload),
    onSuccess: () => invalidateCaseLists(queryClient),
  });
}

export function useCaseMessages(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-messages", caseId],
    queryFn: () => caseApi.messages(caseId),
    enabled: Boolean(caseId) && enabled,
  });
}

export function useSendCaseMessage(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => caseApi.sendMessage(caseId, content),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["case-messages", caseId] }),
  });
}

export function useCaseActivities(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-activities", caseId],
    queryFn: () => caseApi.activities(caseId),
    enabled: Boolean(caseId) && enabled,
  });
}

export function useCreateCaseActivity(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCaseActivityPayload) =>
      caseApi.createActivity(caseId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["case-activities", caseId] }),
  });
}

export function useCaseDocuments(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-documents", caseId],
    queryFn: () => caseApi.caseDocuments(caseId),
    enabled: Boolean(caseId) && enabled,
  });
}

export function useMyCaseDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => caseApi.documents(),
  });
}

export function useCreateCaseDocument(caseId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      caseId: requestedCaseId,
      body,
    }: {
      caseId?: string;
      body: CreateLegalDocumentPayload;
    }) => {
      const targetCaseId = requestedCaseId ?? caseId;
      if (!targetCaseId) {
        throw new Error("A case is required to add a document.");
      }
      return caseApi.createCaseDocument(targetCaseId, body);
    },
    onSuccess: (_data, variables) => {
      const targetCaseId = variables.caseId ?? caseId;
      if (targetCaseId) {
        void queryClient.invalidateQueries({
          queryKey: ["case-documents", targetCaseId],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDeleteCaseDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => caseApi.deleteCaseDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["case-documents"] });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useCaseReports(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-reports", caseId],
    queryFn: () => caseApi.caseReports(caseId),
    enabled: Boolean(caseId) && enabled,
  });
}

export function useMyCaseReports(params?: CaseParams) {
  return useQuery({
    queryKey: ["my-reports", params],
    queryFn: () => caseApi.reports(params),
  });
}

export function useCreateCaseReport(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; summary?: string }) =>
      caseApi.createReport(caseId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["case-reports", caseId] });
      void queryClient.invalidateQueries({ queryKey: ["my-reports"] });
    },
  });
}

export function useCaseInvoices(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-invoices", caseId],
    queryFn: () => caseApi.caseInvoices(caseId),
    enabled: Boolean(caseId) && enabled,
  });
}

export function useCreateCaseInvoice(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCaseInvoicePayload) =>
      caseApi.createCaseInvoice(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["case-invoices", caseId] }),
  });
}

export function useCaseNotes(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-notes", caseId],
    queryFn: () => caseApi.notes(caseId),
    enabled: Boolean(caseId) && enabled,
  });
}

export function useCreateCaseNote(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLawyerNotePayload) =>
      caseApi.createNote(caseId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["case-notes", caseId] }),
  });
}

export function useUpdateCase(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCasePayload) => caseApi.updateCase(caseId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      invalidateCaseLists(queryClient);
    },
  });
}

export function useUpdateCaseStatus(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: CaseStatus) =>
      caseApi.updateCaseStatus(caseId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      invalidateCaseLists(queryClient);
    },
  });
}

export function useAssignCase(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lawyerId: string) => caseApi.assignCase(caseId, lawyerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      invalidateCaseLists(queryClient);
    },
  });
}

export function useCloseCase(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => caseApi.closeCase(caseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      invalidateCaseLists(queryClient);
    },
  });
}

export function useDeleteCase(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => caseApi.deleteCase(caseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      invalidateCaseLists(queryClient);
    },
  });
}

export type { CaseActivity, CasePriority, CaseStatus };
