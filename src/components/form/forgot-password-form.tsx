"use client";

import { type FormEvent, useRef, useState } from "react";
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
  const [requestedEmail, setRequestedEmail] = useState("");
  const emailInput = useRef<HTMLInputElement>(null);
  const requestReset = useRequestPasswordReset();
  const reset = useResetPassword();

  function requestCode() {
    if (!emailInput.current?.reportValidity()) return;

    requestReset.mutate(email.trim(), {
      onSuccess: (response) => {
        if (!response.success) {
          toast.error(response.message || "Could not send a reset code.");
          return;
        }
        setRequestedEmail(email.trim());
        toast.success("Password reset code sent to your email.");
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestedEmail !== email.trim()) {
      toast.error("Request a reset code for this email before continuing.");
      return;
    }
    if (
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword) ||
      newPassword.length < 8
    ) {
      toast.error(
        "Use at least 8 characters with a lowercase letter, uppercase letter, number, and special character.",
      );
      return;
    }

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
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#506057]" htmlFor="reset-email">
          Email
        </label>
        <input
          className={inputClass}
          id="reset-email"
          ref={emailInput}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (requestedEmail && event.target.value.trim() !== requestedEmail) {
              setRequestedEmail("");
            }
          }}
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
      {requestedEmail === email.trim() && (
        <p role="status" className="text-xs leading-5 text-[#39715d]">
          A reset code was sent to {requestedEmail}. Check your inbox and spam
          folder.
        </p>
      )}
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
          pattern="[0-9]{6}"
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
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}"
          title="Use at least 8 characters with a lowercase letter, uppercase letter, number, and special character."
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </div>
      <Button
        type="submit"
        className="h-10 w-full"
        disabled={reset.isPending || requestedEmail !== email.trim()}
      >
        {reset.isPending ? "Updating password..." : "Reset password"}
      </Button>
    </form>
  );
}
