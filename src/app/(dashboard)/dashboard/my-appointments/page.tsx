import { redirect } from "next/navigation";

export default async function LegacyAppointmentPaymentReturn({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const status = params.status === "failue" ? "failure" : params.status;

  if (status === "success" || status === "failure" || status === "cancel") {
    query.set("status", status);
  }
  if (params.error) query.set("error", params.error);

  const queryString = query.toString();
  redirect(`/client/appointments${queryString ? `?${queryString}` : ""}`);
}
