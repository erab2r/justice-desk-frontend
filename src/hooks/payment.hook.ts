import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { initializeAppointmentPayment, verifyStripePayment } from "@/api";

export function useInitializeAppointmentPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initializeAppointmentPayment,
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({
          queryKey: ["overview-appointments"],
        }),
        queryClient.invalidateQueries({ queryKey: ["overview-payments"] }),
      ]);
    },
  });
}

export function useVerifyStripePayment(sessionId: string) {
  return useQuery({
    queryKey: ["stripe-payment-success", sessionId],
    queryFn: () => verifyStripePayment(sessionId),
    enabled: Boolean(sessionId),
    retry: false,
  });
}
