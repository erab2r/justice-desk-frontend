import Link from "next/link";
import ForgotPasswordForm from "@/components/form/forgot-password-form";
import { AuthFrame } from "@/components/form/auth-frame";

export default function ForgotPasswordPage() {
  return (
    <AuthFrame
      eyebrow="Account recovery"
      title="Reset your password"
      description="Request a one-time code and choose a new password."
      footer={
        <Link
          href="/login"
          className="font-semibold text-[#39715d] hover:underline"
        >
          Return to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthFrame>
  );
}
