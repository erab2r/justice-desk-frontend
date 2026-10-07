import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  PayAppointmentPayload,
  StripePaymentVerificationResponse,
} from "@/types";

export function initializeAppointmentPayment(payload: PayAppointmentPayload) {
  return apiClient
    .post<ApiResponse<{ paymentUrl: string }>>(
      "/appointment/pay-appointment",
      payload,
    )
    .then(({ data }) => data);
}

export function verifyStripePayment(sessionId: string) {
  return apiClient
    .get<StripePaymentVerificationResponse>("/appointment/stripe/success", {
      params: { session_id: sessionId },
    })
    .then(({ data }) => data);
}
