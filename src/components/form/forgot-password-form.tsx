"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRequestPasswordReset, useResetPassword } from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";

const inputClass =
  "h-10 w-full rounded-md border border-[#d9e2dc] bg-white px-3 text-sm text-[#26382d] outline-none focus:border-[#56826c] focus:ring-2 focus:ring-[#56826c]/15";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const requestReset = useRequestPasswordReset();
  const reset = useResetPassword();

  function requestCode() {
    requestReset.mutate(email.trim(), {
      onSuccess: (response) => {
        if (!response.success) {
          toast.error(response.message || "Could not send a reset code.");
          return;
        }
        toast.success("Password reset code sent to your email.");
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset.mutate(
      { email: email.trim(), otp: otp.trim(), newPassword },
      {
        onSuccess: (response) => {
          if (!response.success) {
            toast.error(response.message || "Could not reset the password.");
            return;
          }
          toast.success("Password changed. Sign in with the new password.");
          router.replace("/login");
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#506057]" htmlFor="reset-email">
          Email
        </label>
        <input
          className={inputClass}
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={!email.trim() || requestReset.isPending}
        onClick={requestCode}
      >
        {requestReset.isPending ? "Sending code..." : "Send reset code"}
      </Button>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#506057]" htmlFor="reset-otp">
          Email code
        </label>
        <input
          className={inputClass}
          id="reset-otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          minLength={6}
          maxLength={6}
          required
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#506057]" htmlFor="reset-password">
          New password
        </label>
        <input
          className={inputClass}
          id="reset-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={reset.isPending}>
        {reset.isPending ? "Updating password..." : "Reset password"}
      </Button>
    </form>
  );
}
