import Link from "next/link";
import { RegisterForm } from "@/components/form/register-form";
import { AuthFrame } from "@/components/form/auth-frame";

export default function RegisterPage() {
  return (
    <AuthFrame
      eyebrow="Client account"
      title="Start with a clear next step"
      description="Create your account to find counsel and manage legal appointments."
      footer={
        <>
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#39715d] hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthFrame>
  );
}
