import type { PaginationMeta } from "./api.type";

export type ScheduleStatus = "DRAFT" | "PUBLISHED";

export interface ScheduleLawyer {
  id: string;
  userId: string;
  bio?: string | null;
  experienceYears?: number;
  consultationFee?: number | string | null;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

export interface Schedule {
  id: string;
  startDateTime: string;
  endDateTime: string;
  meetingLink: string | null;
  totalSlots: number;
  availableSlots: number;
  status: ScheduleStatus;
  lawyerId?: string;
  lawyer?: ScheduleLawyer;
}

export interface ScheduleListData {
  data: Schedule[];
  meta: PaginationMeta;
}

export interface CreateSchedulePayload {
  startDateTime: string;
  endDateTime: string;
  totalSlots: number;
  meetingLink: string;
}

export interface UpdateSchedulePayload {
  startDateTime?: string;
  endDateTime?: string;
  totalSlots?: number;
  meetingLink?: string;
}

export interface UpdateScheduleStatusPayload {
  status: ScheduleStatus;
}

export interface ScheduleParams {
  page?: number;
  limit?: number;
  lawyerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: ScheduleStatus;
}
