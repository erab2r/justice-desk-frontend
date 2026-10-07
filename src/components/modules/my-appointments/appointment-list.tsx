"use client";

import PaymentReturnNotice from "@/components/modules/payments/payment-return-notice";
import { Button } from "@/components/ui/button";
import { useGetMyAppointments } from "@/hooks";

export default function AppointmentList() {
  const { data } = useGetMyAppointments({ page: 1, limit: 100 });

  const appointments = data?.data || [];

  if (appointments.length === 0) {
    return (
      <>
        <PaymentReturnNotice />
        <p>There is not appointment</p>
      </>
    );
  }

  return (
    <div>
      <PaymentReturnNotice />
      {appointments.map(({ lawyer, status, id }) => (
        <div key={id} className="border rounded-md p-3">
          <div className="w-full flex gap-3">
            <span>Lawyer: {lawyer?.name ?? "Assigned lawyer"}</span>
            <span>Status: {status}</span>
            <div className="ml-auto">
              <Button>Join</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
