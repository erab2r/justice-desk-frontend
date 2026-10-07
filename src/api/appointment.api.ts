import apiClient from "@/lib/apiClient";
import type { ApiResponse, Appointment, BookAppointmentPayload } from "@/types";

export function bookAppointment(payload: BookAppointmentPayload) {
  return apiClient
    .post<ApiResponse<{ paymentUrl: string }>>(
      "/appointment/book-appointment",
      payload,
    )
    .then(({ data }) => data);
}

export function getMyAppointments(params: { page?: number; limit?: number }) {
  return apiClient
    .get<ApiResponse<Appointment[]>>("/appointment/my-appointments", {
      params,
    })
    .then(({ data }) => data);
}
