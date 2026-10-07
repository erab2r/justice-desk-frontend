import StripePaymentSuccess from "@/components/modules/payments/stripe-payment-success";

export default async function StripePaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const resolvedSessionId = typeof sessionId === "string" ? sessionId : "";

  if (!resolvedSessionId) {
    return (
      <div className="mx-auto max-w-xl border border-[#ead8d3] bg-white p-6">
        <h1 className="text-lg font-semibold text-[#895346]">
          Payment session unavailable
        </h1>
        <p role="alert" className="mt-2 text-sm text-[#895346]">
          Stripe did not return a checkout session ID, so the payment cannot be
          verified.
        </p>
      </div>
    );
  }

  return <StripePaymentSuccess sessionId={resolvedSessionId} />;
}
