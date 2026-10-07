import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  createSchedule,
  deleteSchedule,
  getAvailableSchedules,
  getMySchedules,
  publishSchedule,
} from "@/api";
import type { ScheduleParams } from "@/types";

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useMySchedules(params: ScheduleParams) {
  return useQuery({
    queryKey: ["schedules", params],
    queryFn: () => getMySchedules(params),
  });
}

export function useAvailableSchedules(params: ScheduleParams, enabled = true) {
  return useQuery({
    queryKey: ["available-schedules", params],
    queryFn: () => getAvailableSchedules(params),
    enabled,
  });
}

export function useSuspenseMySchedules(params: ScheduleParams) {
  return useSuspenseQuery({
    queryKey: ["schedules", params],
    queryFn: () => getMySchedules(params),
  });
}

export function usePublishSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishSchedule,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["schedules"] }),
        queryClient.invalidateQueries({ queryKey: ["available-schedules"] }),
      ]),
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}
