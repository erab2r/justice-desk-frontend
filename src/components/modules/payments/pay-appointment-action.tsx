"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useInitializeAppointmentPayment } from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { PaymentGateway } from "@/types/appointment.type";

export default function PayAppointmentAction({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const [gateway, setGateway] = useState<PaymentGateway>("STRIPE");
  const { mutate: initializePayment, isPending } =
    useInitializeAppointmentPayment();

  function handlePay() {
    initializePayment(
      { appointmentId, paymentGateway: gateway },
      {
        onSuccess: (response) => {
          const paymentUrl = response.data?.paymentUrl;
          if (!response.success || !paymentUrl) {
            toast.error(
              response.message || "The server did not return a payment link.",
            );
            return;
          }
          window.location.assign(paymentUrl);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <div className="flex items-center gap-1">
      <label className="sr-only" htmlFor={`payment-gateway-${appointmentId}`}>
        Payment provider
      </label>
      <select
        id={`payment-gateway-${appointmentId}`}
        aria-label="Payment provider"
        value={gateway}
        disabled={isPending}
        onChange={(event) => setGateway(event.target.value as PaymentGateway)}
        className="h-7 rounded border border-[#dce4de] bg-white px-1 text-[10px]"
      >
        <option value="STRIPE">Stripe</option>
        <option value="BKASH">bKash</option>
      </select>
      <Button
        size="sm"
        disabled={isPending}
        onClick={handlePay}
        className="h-7 px-2 text-[10px]"
      >
        {isPending ? "Starting..." : "Pay"}
      </Button>
    </div>
  );
}
