"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  useVerifyAccount,
  useVerifyLawyerAccount,
} from "@/hooks";
import { toast } from "../ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { getMe } from "@/api";
import { getApiErrorMessage } from "@/lib/apiClient";
import { dashboardPathForRole } from "@/routes/dashboard.routes";

export default function VerifyAccountForm({
  mode = "CLIENT",
}: {
  mode: "LAWYER" | "CLIENT";
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [otp, setOtp] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const { mutate: verifyClient } = useVerifyAccount();
  const { mutate: verifyLawyer } = useVerifyLawyerAccount();

  const verify = mode === "LAWYER" ? verifyLawyer : verifyClient;

  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      router.replace("/");
    }
  }, [email, router]);

  const handleOTP = () => {
    if (otp.length !== 6) {
      setIsInvalid(true);
      return;
    }

    const verifyData = {
      email,
      otp,
    };

    verify(verifyData, {
      onSuccess: async (res) => {
        if (!res.success) {
          toast.add({
            title: "Server Failure",
            description: res.message || "Something went wrong. Please try again",
            type: "error",
          });
          return;
        }

        if (mode === "LAWYER") {
          toast.add({
            title: "Verification Successful",
            description:
              "An admin will approve your account. This may take time. Please check your email in few days",
            type: "success",
          });
          router.push("/");

          return;
        }

        toast.add({
          title: "Verification Successful",
          description: "Welcome onboard",
          type: "success",
        });
        queryClient.removeQueries({ queryKey: ["user"] });
        try {
          const user = await queryClient.fetchQuery({
            queryKey: ["user"],
            queryFn: getMe,
            staleTime: 0,
          });
          router.replace(dashboardPathForRole(user.role));
        } catch (error) {
          toast.add({
            title: "Unable to verify your account",
            description: getApiErrorMessage(error),
            type: "error",
          });
        }
      },
      onError: (err) => {
        toast.add({
          title: "Verification failure",
          description: getApiErrorMessage(err),
          type: "error",
        });
      },
    });
  };

  if (!email) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Account</CardTitle>
        <CardDescription>
          Please provide the OTP we send you in your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="otp-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOTP();
          }}
        >
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor="otp">OTP</FieldLabel>
            <InputOTP
              maxLength={6}
              onChange={(value) => {
                setOtp(value);
                if (isInvalid) {
                  setIsInvalid(false);
                }
              }}
              value={otp}
              autoComplete="off"
              name="otp"
              id="otp"
              pattern={REGEXP_ONLY_DIGITS}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {isInvalid && (
              <FieldError
                errors={[{ message: "Invalid Code. Please try again" }]}
              />
            )}
            <FieldDescription>
              Enter the six-digit code sent to your email.
            </FieldDescription>
          </Field>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="otp-form">
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
}