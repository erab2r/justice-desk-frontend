import type { Appointment } from "./appointment.type";
import type { UserRole } from "./user.type";

export const CASE_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FOR_CLIENT",
  "RESOLVED",
  "CLOSED",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];
export type CasePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export function isCaseStatus(value: string): value is CaseStatus {
  return CASE_STATUSES.some((status) => status === value);
}
export const DOCUMENT_TYPES = [
  "ID_DOCUMENT",
  "COURT_DOCUMENT",
  "EVIDENCE",
  "CONTRACT",
  "AGREEMENT",
  "LEGAL_NOTICE",
  "CASE_FILE",
  "OTHER",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export function isDocumentType(value: string): value is DocumentType {
  return DOCUMENT_TYPES.some((documentType) => documentType === value);
}

export interface CasePerson {
  id: string;
  name: string;
  email?: string;
}

export interface CaseLawyer extends CasePerson {
  consultationFee?: number | string | null;
  qualifications?: string;
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  description?: string | null;
  caseType?: string | null;
  status: CaseStatus;
  priority: CasePriority;
  courtName?: string | null;
  courtCaseNumber?: string | null;
  filingDate?: string | null;
  createdAt: string;
  client?: CasePerson;
  lawyer?: CaseLawyer;
  appointment?: Appointment | null;
}

export interface CreateCasePayload {
  title: string;
  description?: string;
  caseType?: string;
  priority?: CasePriority;
  courtName?: string;
  courtCaseNumber?: string;
  filingDate?: string;
  lawyerId: string;
  appointmentId: string;
}

export interface UpdateCasePayload {
  title?: string;
  description?: string;
  caseType?: string;
  priority?: CasePriority;
  courtName?: string;
  courtCaseNumber?: string;
  filingDate?: string;
}

export interface CaseActivity {
  id: string;
  caseId?: string;
  action: string;
  message?: string | null;
  oldStatus?: string | null;
  newStatus?: string | null;
  createdAt: string;
  createdById?: string;
}

export interface CreateCaseActivityPayload {
  action: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface CaseMessage {
  id: string;
  content: string;
  createdAt: string;
  sender?: { id: string; name: string; role?: UserRole };
}

export interface LegalDocument {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  filePublicId?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  documentType: DocumentType;
  createdAt: string;
  case?: { id: string; caseNumber: string; title: string };
  client?: CasePerson | null;
  lawyer?: CasePerson | null;
  uploadedBy?: CasePerson;
}

export interface CaseReport {
  id: string;
  title: string;
  summary?: string | null;
  reportUrl?: string | null;
  reportPublicId?: string | null;
  generatedById?: string;
  createdAt: string;
  case?: {
    id: string;
    caseNumber: string;
    title: string;
    status?: CaseStatus;
    priority?: CasePriority;
  };
  generatedBy?: CasePerson & { role?: UserRole };
}

export interface CreateLegalDocumentPayload {
  title: string;
  description?: string;
  fileUrl: string;
  filePublicId?: string;
  fileType?: string;
  fileSize?: number;
  documentType: DocumentType;
}

export interface UpdateLegalDocumentPayload {
  title?: string;
  description?: string;
  documentType?: DocumentType;
}

export interface CaseInvoice {
  id: string;
  invoiceNumber: string;
  amount: number | string;
  tax: number | string;
  totalAmount: number | string;
  currency: string;
  status: "UNPAID" | "PAID" | "PARTIALLY_PAID" | "OVERDUE" | "CANCELLED";
  invoiceDate: string;
  dueDate?: string | null;
  description?: string | null;
  pdfUrl?: string | null;
  case?: { id: string; caseNumber: string; title: string };
  client?: CasePerson;
  lawyer?: CasePerson;
}

export interface CreateCaseInvoicePayload {
  amount: number;
  tax?: number;
  currency: string;
  dueDate?: string;
  description: string;
  caseId: string;
  clientId: string;
  lawyerId: string;
}

export interface CreateCaseReportPayload {
  title: string;
  summary?: string;
  reportUrl?: string;
  reportPublicId?: string;
  generatedBy?: string;
}

export interface UpdateCaseReportPayload {
  title?: string;
  summary?: string;
  reportUrl?: string;
  reportPublicId?: string;
}

export interface CreateLawyerNotePayload {
  title?: string;
  content: string;
  isPrivate?: boolean;
}

export interface LawyerNote {
  id: string;
  title?: string | null;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  case?: { id: string; caseNumber: string; title: string };
  lawyer?: CasePerson;
}

export interface UpdateLawyerNotePayload {
  title?: string;
  content?: string;
  isPrivate?: boolean;
}

export type CaseParams = Record<string, string | number | undefined>;
