"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentReturnNotice() {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const status = params.get("status");
  const error = params.get("error");
  const isPaymentReturn = Boolean(status || error);

  useEffect(() => {
    if (!isPaymentReturn) return;
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["appointments"] }),
      queryClient.invalidateQueries({ queryKey: ["payments"] }),
      queryClient.invalidateQueries({
        queryKey: ["overview-appointments"],
      }),
      queryClient.invalidateQueries({ queryKey: ["overview-payments"] }),
    ]);
  }, [isPaymentReturn, queryClient]);

  if (!isPaymentReturn) return null;

  const message =
    status === "success"
      ? "Payment provider returned. Confirm completion only when the latest server data shows PAID and CONFIRMED."
      : status === "failure" || status === "failue" || status === "cancel"
        ? "Payment was not completed. Your appointment and payment status below are refreshed from the server."
        : "Payment returned an error. Your current appointment and payment status are shown below.";

  return (
    <output className="mb-4 block border border-[#d9e2dc] bg-white px-4 py-3 text-sm text-[#41564a]">
      {message}
    </output>
  );
}
