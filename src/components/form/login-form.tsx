"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getMe } from "@/api";
import { useLogin } from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import { authenticatedPathForUser } from "@/routes/dashboard.routes";
import { loginSchema } from "@/validation";
import GoogleLoginComponent from "../modules/google-login/GoogleLogin";
import { Button } from "../ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { toast } from "../ui/toast";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: login, isPending: loginPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => {
      setLoginError("");
      const loginData = {
        email: value.email,
        password: value.password,
      };

      login(loginData, {
        onSuccess: async () => {
          queryClient.removeQueries({ queryKey: ["user"] });
          try {
            const user = await queryClient.fetchQuery({
              queryKey: ["user"],
              queryFn: getMe,
              staleTime: 0,
            });
            toast.add({
              title: "Login Success",
              description: "Welcome back",
              type: "success",
            });
            router.replace(authenticatedPathForUser(user));
          } catch (error) {
            setLoginError(getApiErrorMessage(error));
            toast.add({
              title: "Unable to verify your account",
              description: getApiErrorMessage(error),
              type: "error",
            });
          }
        },
        onError: (err) => {
          setLoginError(getApiErrorMessage(err));
          toast.add({
            title: "Authorization failure",
            description: getApiErrorMessage(err),
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-[#20372b] sm:text-2xl">
          Login to your account
        </h1>
        <p className="max-w-sm text-balance text-sm leading-6 text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-5">
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={field.state.value}
                    className="h-10"
                    autoComplete="off"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      className="h-10 pr-10"
                      autoComplete="off"
                      aria-invalid={isInvalid}
                    />
                    <button
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeClosed className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          {loginError && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {loginError}
            </p>
          )}

          <div className="-mt-2 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#39715d] transition-colors hover:text-[#24533f] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Forgot password?
            </Link>
          </div>

          <Button disabled={loginPending} type="submit" className="h-10 w-full">
            {loginPending ? (
              <>
                <Spinner /> submitting
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </FieldGroup>
      </form>

      <FieldSeparator>Or continue with</FieldSeparator>

      <GoogleLoginComponent />

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
