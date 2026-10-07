import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api.type";
import type {
  CreateSchedulePayload,
  ScheduleListData,
  Schedule,
  ScheduleParams,
  UpdateScheduleStatusPayload,
} from "@/types/schedule.type";

export function createSchedule(payload: CreateSchedulePayload) {
  return apiClient
    .post<ApiResponse<Schedule>>("/schedule/", payload)
    .then(({ data }) => data);
}

export function getMySchedules(params: ScheduleParams) {
  return apiClient
    .get<ApiResponse<ScheduleListData>>("/schedule/my-schedules", { params })
    .then(({ data }) => data);
}

export function getAvailableSchedules(params: ScheduleParams) {
  return apiClient
    .get<ApiResponse<ScheduleListData>>("/schedule/available", { params })
    .then(({ data }) => data);
}

export function publishSchedule(scheduleId: string) {
  const payload: UpdateScheduleStatusPayload = { status: "PUBLISHED" };
  return apiClient
    .patch<ApiResponse<Schedule>>(`/schedule/${scheduleId}/status`, payload)
    .then(({ data }) => data);
}

export function deleteSchedule(scheduleId: string) {
  return apiClient
    .delete<ApiResponse<Schedule>>(`/schedule/${scheduleId}`)
    .then(({ data }) => data);
}
