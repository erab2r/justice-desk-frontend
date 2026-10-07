"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useVerifyStripePayment } from "@/hooks/payment.hook";
import { getApiErrorMessage } from "@/lib/apiClient";

export default function StripePaymentSuccess({
  sessionId,
}: {
  sessionId: string;
}) {
  const payment = useVerifyStripePayment(sessionId);
  const queryClient = useQueryClient();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || !payment.data) return;
    handled.current = true;

    const result = payment.data;
    const isVerified =
      result.sessionId === sessionId &&
      result.stripePaymentStatus === "paid" &&
      result.appointment.status === "CONFIRMED" &&
      result.appointment.payment?.status === "PAID" &&
      result.appointment.payment.paymentGateway === "STRIPE";

    if (!isVerified) {
      toast.error(
        result.message || "The backend did not confirm successful payment.",
      );
      return;
    }

    const refreshAndNavigate = async () => {
      toast.success(result.message);
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["appointments"] }),
          queryClient.invalidateQueries({
            queryKey: ["appointment", result.appointment.id],
          }),
          queryClient.invalidateQueries({ queryKey: ["payments"] }),
          queryClient.invalidateQueries({
            queryKey: ["overview-appointments"],
          }),
          queryClient.invalidateQueries({ queryKey: ["overview-payments"] }),
        ]);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }

      router.replace(
        `/client/appointments/${encodeURIComponent(result.appointment.id)}`,
      );
    };

    void refreshAndNavigate();
  }, [payment.data, queryClient, router, sessionId]);

  useEffect(() => {
    if (handled.current || !payment.isError) return;
    handled.current = true;
    toast.error(getApiErrorMessage(payment.error));
  }, [payment.error, payment.isError]);

  return (
    <div className="mx-auto max-w-xl border border-[#dfe6e2] bg-white p-6">
      <h1 className="text-lg font-semibold text-[#24382c]">
        {payment.isError ? "Payment verification failed" : "Verifying payment"}
      </h1>
      <p
        role={payment.isError ? "alert" : "status"}
        className="mt-2 text-sm text-[#69766e]"
      >
        {payment.isError
          ? getApiErrorMessage(payment.error)
          : "Please wait while we confirm your payment with the server."}
      </p>
    </div>
  );
}
