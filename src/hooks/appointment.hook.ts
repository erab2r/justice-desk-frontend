import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookAppointment, getMyAppointments } from "@/api";

export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
        queryClient.invalidateQueries({ queryKey: ["available-schedules"] }),
        queryClient.invalidateQueries({
          queryKey: ["overview-appointments"],
        }),
      ]);
    },
  });
}

export function useGetMyAppointments(
  params: {
    page?: number;
    limit?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: ["appointments", "CLIENT", params],
    queryFn: () => getMyAppointments(params),
    enabled,
  });
}
