import Link from "next/link";
// import AuthFrame from "@/components/form/auth-frame";
import LawyerApplyForm from "@/components/form/lawyer-apply-form";
import { AuthFrame } from "@/components/form/auth-frame";

export default function ApplyPage() {
  return (
    <AuthFrame
      eyebrow="Counsel onboarding"
      title="Apply to join the legal network"
      description="Provide your professional details for administrator review. Email verification follows submission."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#39715d] hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <LawyerApplyForm />
    </AuthFrame>
  );
}
