import Link from "next/link";
// import AuthFrame from "@/components/form/auth-frame";
import LoginForm from "@/components/form/login-form";
import { AuthFrame } from "@/components/form/auth-frame";

export default function LoginPage() {
  return (
    <AuthFrame
      eyebrow="Welcome back"
      title="Sign in to your workspace"
      description="Access your appointments, case files, and legal team."
      footer={
        <>
          New to Justice Desk?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#39715d] hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthFrame>
  );
}
