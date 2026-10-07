import { Suspense } from "react";
import {AuthFrame} from "@/components/form/auth-frame";
import VerifyAccountForm from "@/components/form/verify-account-form";

export default function VerifyLawyerAccountPage() {
  return (
    <AuthFrame
      eyebrow="Lawyer application"
      title="Verify your email address"
      description="Enter the six-digit code sent after your application was received."
    >
      <Suspense
        fallback={
          <p className="text-sm text-[#738078]">Loading verification form...</p>
        }
      >
        <VerifyAccountForm mode="LAWYER" />
      </Suspense>
    </AuthFrame>
  );
}
