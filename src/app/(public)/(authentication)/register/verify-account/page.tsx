import { Suspense } from "react";
import VerifyAccountForm from "@/components/form/verify-account-form";
import { AuthFrame } from "@/components/form/auth-frame";

export default function VerifyAccountPage() {
  return (
    <AuthFrame
      eyebrow="Email verification"
      title="Enter your verification code"
      description="Use the six-digit code sent to the email address you registered."
    >
      <Suspense
        fallback={
          <p className="text-sm text-[#738078]">Loading verification form...</p>
        }
      >
        <VerifyAccountForm mode="CLIENT" />
      </Suspense>
    </AuthFrame>
  );
}
