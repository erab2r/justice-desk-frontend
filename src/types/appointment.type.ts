import type { Schedule } from "./schedule.type";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "ONGOING"
  | "COMPLETED";

export type PaymentStatus =
  | "UNPAID"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentGateway = "STRIPE" | "BKASH";

export interface Appointment {
  id: string;
  status: AppointmentStatus;
  clientId?: string;
  lawyerId?: string;
  joiningTime?: string | null;
  serialNumber?: number | null;
  meetingLink?: string | null;
  createdAt: string;
  lawyer?: { id: string; name: string; email?: string };
  client?: { id: string; name: string; email?: string };
  schedule?: Schedule;
  payment?: {
    amount: number | string;
    status: PaymentStatus;
    paymentGateway: PaymentGateway;
  };
  case?: { id: string; caseNumber: string; title: string } | null;
}

export interface BookAppointmentPayload {
  scheduleId: string;
  paymentGateway: PaymentGateway;
}

export interface PayAppointmentPayload {
  appointmentId: string;
  paymentGateway: PaymentGateway;
}

export type ICreatePaymentPayload = PayAppointmentPayload;

export interface IVerifyPaymentPayload {
  paymentId: string;
}

export interface IRefundPaymentPayload {
  paymentId: string;
  reason?: string;
}

export interface IPaymentGatewayResponse {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  message?: string;
  data?: unknown;
}

export interface IStripePaymentResponse {
  sessionId: string;
  sessionUrl: string;
}

export interface StripePaymentVerificationResponse {
  message: string;
  sessionId: string;
  stripePaymentStatus: string;
  appointment: Appointment;
}

export interface IBkashPaymentResponse {
  paymentId: string;
  bkashURL: string;
}

export interface IPaymentFilterRequest {
  status?: string;
  paymentGateway?: PaymentGateway;
  appointmentId?: string;
  clientEmail?: string;
}

export type IBookAppointmentPayload = BookAppointmentPayload;
export type IPayAppointmentPayload = PayAppointmentPayload;

export interface ICancelAppointmentPayload {
  appointmentId: string;
}

export interface IUpdateAppointmentStatusPayload {
  status: "ONGOING" | "COMPLETED";
}
