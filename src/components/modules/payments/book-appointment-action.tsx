"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBookAppointment } from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { PaymentGateway } from "@/types/appointment.type";

export default function BookAppointmentAction({
  scheduleId,
  disabled,
}: {
  scheduleId: string;
  disabled?: boolean;
}) {
  const [gateway, setGateway] = useState<PaymentGateway>("STRIPE");
  const { mutate: book, isPending } = useBookAppointment();

  function handleBook() {
    book(
      { scheduleId, paymentGateway: gateway },
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
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor={`gateway-${scheduleId}`}>
        Payment provider
      </label>
      <select
        id={`gateway-${scheduleId}`}
        aria-label="Payment provider"
        value={gateway}
        disabled={isPending}
        onChange={(event) => setGateway(event.target.value as PaymentGateway)}
        className="h-8 rounded border border-[#dce4de] bg-white px-2 text-xs"
      >
        <option value="STRIPE">Stripe</option>
        <option value="BKASH">bKash</option>
      </select>
      <Button
        size="sm"
        disabled={disabled || isPending}
        onClick={handleBook}
        className="h-8 shrink-0 bg-[#174638] text-xs text-white"
      >
        {isPending ? "Starting..." : "Book"}
      </Button>
    </div>
  );
}
