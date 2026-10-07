"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useBookAppointment,
  useGetMe,
  useAvailableSchedules,
} from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { Schedule } from "@/types";
import type { PaymentGateway } from "@/types/appointment.type";

interface BookingConfirmation {
  schedule: Schedule;
  paymentUrl: string;
}

export default function LawyerBooking({ lawyerId }: { lawyerId: string }) {
  const router = useRouter();

  const { data: me, isPending: mePending } = useGetMe();
  const { data, isPending, error } = useAvailableSchedules(
    { lawyerId, page: 1, limit: 50 },
    Boolean(lawyerId),
  );
  const { mutate: book, isPending: bookingPending } = useBookAppointment();
  const [gateway, setGateway] = useState<PaymentGateway>("STRIPE");
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null,
  );

  const schedules = data?.data.data ?? [];

  const handleBooking = (schedule: Schedule) => {
    if (!mePending && !me) {
      router.push("/login");
      return;
    }

    book(
      { scheduleId: schedule.id, paymentGateway: gateway },
      {
        onSuccess: (res) => {
          const paymentUrl = res.data?.paymentUrl;
          if (!res.success || !paymentUrl) {
            toast.error(
              res.message || "The server did not return a payment link.",
            );
            return;
          }
          setConfirmation({ paymentUrl, schedule });
        },
        onError: (bookError) => toast.error(getApiErrorMessage(bookError)),
      },
    );
  };

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Spinner />
          <span className="text-sm text-muted-foreground">
            Loading today&apos;s slots…
          </span>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        Could not load slots. Please try again.
      </p>
    );
  }

  if (schedules.length === 0) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        No available schedules for this lawyer. Please try again later.
      </p>
    );
  }

  return (
    <>
      <label className="mb-3 flex items-center gap-2 text-sm">
        Payment provider
        <select
          value={gateway}
          disabled={bookingPending}
          onChange={(event) => setGateway(event.target.value as PaymentGateway)}
          className="rounded border px-2 py-1"
        >
          <option value="STRIPE">Stripe</option>
          <option value="BKASH">bKash</option>
        </select>
      </label>
      <div>
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="border rounded-md p-3 flex gap-5 items-center"
          >
            <span>{format(schedule.startDateTime, "eeee")}</span>
            <span>{format(schedule.startDateTime, "PP")}</span>
            <span className="text-sm text-muted-foreground">
              Starts at {format(schedule.startDateTime, "p")}
            </span>
            <span className="text-sm text-muted-foreground">
              Ends at {format(schedule.endDateTime, "p")}
            </span>
            <Button className="ml-auto" onClick={() => handleBooking(schedule)}>
              {bookingPending ? "Booking..." : "Book Now"}
            </Button>
          </div>
        ))}
      </div>
      <Dialog
        open={!!confirmation}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setConfirmation(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment is ready</DialogTitle>
            <DialogDescription>
              Continue to the selected payment provider. Your appointment
              remains pending until the backend verifies payment.
            </DialogDescription>
            <span>
              Data and Time:
              {confirmation
                ? format(confirmation.schedule.startDateTime, "PPP")
                : "-"}
            </span>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmation(null)}>
              Pay Later
            </Button>
            <Button
              onClick={() => {
                if (confirmation) {
                  window.location.href = confirmation.paymentUrl;
                }
              }}
            >
              Pay Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
