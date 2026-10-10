import apiClient from "@/lib/apiClient";
import type { ApiResponse, PaginationMeta } from "@/types/api.type";
import type { Appointment } from "@/types/appointment.type";
import type {
  CaseActivity,
  CaseMessage,
  CasePriority,
  CaseStatus,
  LegalCase,
  LegalDocument,
} from "@/types/case.type";
import type { Lawyer, Specialization } from "@/types/lawyer.type";

export type { Appointment } from "@/types/appointment.type";
export type {
  CaseActivity,
  CaseMessage,
  CasePriority,
  CaseStatus,
  LegalCase,
  LegalDocument,
} from "@/types/case.type";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "LAWYER" | "CLIENT";
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "ONGOING"
  | "COMPLETED";
export type PaymentGateway = "STRIPE" | "BKASH";
export type PaymentStatus =
  | "UNPAID"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";
export interface Paginated<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T[];
  meta?: PaginationMeta;
}

export interface Schedule {
  id: string;
  startDateTime: string;
  endDateTime: string;
  meetingLink?: string | null;
  totalSlots: number;
  availableSlots: number;
  status: "DRAFT" | "PUBLISHED";
  lawyerId?: string;
  lawyer?: Lawyer;
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  amount: number | string;
  currency: string;
  paymentGateway: PaymentGateway;
  merchantInvoiceNumber?: string;
  stripePaymentIntentId?: string | null;
  stripeSessionId?: string | null;
  bkashPaymentId?: string | null;
  bkashTrxId?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  appointment?: Appointment;
}

export interface Invoice {
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
  client?: { id: string; name: string };
  lawyer?: { id: string; name: string };
}

export interface EntityList<T> {
  data: T[];
  meta?: PaginationMeta;
}

export interface AppointmentJoinResult {
  meetingLink?: string | null;
  schedule?: { meetingLink?: string | null } | null;
}

function get<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
) {
  return apiClient.get<ApiResponse<T>>(path, { params }).then(({ data }) => {
    if (!data.success) {
      throw new Error(data.message || `The request to ${path} failed.`);
    }
    return data;
  });
}

function post<T>(path: string, body?: unknown) {
  return apiClient.post<ApiResponse<T>>(path, body).then(({ data }) => data);
}

function patch<T>(path: string, body?: unknown) {
  return apiClient.patch<ApiResponse<T>>(path, body).then(({ data }) => data);
}

function remove<T>(path: string) {
  return apiClient.delete<ApiResponse<T>>(path).then(({ data }) => data);
}

export const justiceService = {
  specializations: () => get<Specialization[]>("/specialization/"),
  specializationRequests: () => get<unknown[]>("/specialization/requests"),
  requestSpecialization: (specializationId: string) =>
    post<unknown>("/specialization/requests", { specializationId }),
  reviewSpecialization: (body: {
    requestId: string;
    status: "APPROVED" | "REJECTED";
    rejectionReason?: string;
  }) => patch<unknown>("/specialization/requests/review", body),
  createSpecialization: (body: { name: string; description?: string }) =>
    post<Specialization>("/specialization/", body),
  updateSpecialization: (
    id: string,
    body: { name: string; description: string },
  ) => patch<Specialization>(`/specialization/${id}`, body),

  appointments: (
    role: UserRole,
    params?: Record<string, string | number | undefined>,
  ) => {
    if (role === "CLIENT")
      return get<Appointment[]>("/appointment/my-appointments", params);
    if (role === "LAWYER")
      return get<Appointment[]>("/appointment/lawyer-appointments", params);
    return get<Appointment[]>("/appointment/all-appointments", params);
  },
  allAppointments: (params?: Record<string, string | number | undefined>) =>
    get<Appointment[]>("/appointment/all-appointments", params),
  appointment: (id: string) => get<Appointment>(`/appointment/${id}`),
  cancelAppointment: (appointmentId: string) =>
    post<{ appointment: Appointment; payment: Payment | null }>(
      "/appointment/cancel-appointment",
      { appointmentId },
    ),
  updateAppointmentStatus: (id: string, status: "ONGOING" | "COMPLETED") =>
    patch<Appointment>(`/appointment/update-status/${id}`, { status }),
  joinAppointment: (id: string) =>
    post<AppointmentJoinResult>(`/appointment/join/${id}`),

  payments: (
    role: UserRole,
    params?: Record<string, string | number | undefined>,
  ) => {
    if (role === "ADMIN" || role === "SUPER_ADMIN")
      return get<Payment[]>("/payment/all-payments", params);
    return get<Payment[]>("/payment/my-payments", params);
  },
  allPayments: (params?: Record<string, string | number | undefined>) =>
    get<Payment[]>("/payment/all-payments", params),
  payment: (id: string) => get<Payment>(`/payment/${id}`),
  invoices: (
    role: UserRole,
    params?: Record<string, string | number | undefined>,
  ) =>
    get<Invoice[]>(
      role === "ADMIN" || role === "SUPER_ADMIN"
        ? "/invoice/all-invoices"
        : "/invoice/my-invoices",
      params,
    ),
  invoice: (id: string) => get<Invoice>(`/invoice/${id}`),
  updateInvoice: (id: string, body: Record<string, unknown>) =>
    patch<Invoice>(`/invoice/${id}`, body),
  updateInvoiceStatus: (id: string, status: Invoice["status"]) =>
    patch<Invoice>(`/invoice/${id}/status`, { status }),
  regenerateInvoicePdf: (id: string) =>
    post<{ url: string; publicId: string }>(`/invoice/${id}/regenerate-pdf`),
  deleteInvoice: (id: string) => remove<null>(`/invoice/${id}`),

  updateProfileImage: (file: File) => {
    const form = new FormData();
    form.append("profileImage", file);
    return apiClient
      .patch<ApiResponse<unknown>>("/user/profile-image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(({ data }) => data);
  },
};

export type { ApiResponse, PaginationMeta };
