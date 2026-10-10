"use client";

import { useForm } from "@tanstack/react-form";
import {
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  FileText,
  FileUp,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApplyAsLawyer, useSpecializations } from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { LawyerApplicationPayload } from "@/types/auth.type";
import { formatFileSize } from "@/utils";
import {
  lawyerApplicationSchema,
  MAX_ADDITIONAL_FILES,
  MAX_FILE_SIZE,
} from "@/validation";
import { Spinner } from "../ui/spinner";
import { toast } from "../ui/toast";

export default function LawyerApplyForm() {
  const router = useRouter();
  const { mutate: apply, isPending: applyPending } = useApplyAsLawyer();
  const specializations = useSpecializations();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      specializationIds: [] as string[],
      newPracticeArea: "",
      licenseNumber: "",
      qualifications: "",
      experienceYears: "",
      consultationFee: "",
      bio: "",
      resume: null as File | null,
      additionalFiles: [] as File[],
    },
    validators: {
      onSubmit: lawyerApplicationSchema,
    },

    onSubmit: async ({ value }) => {
      const application: LawyerApplicationPayload = {
        user: {
          name: value.name.trim(),
          email: value.email.trim(),
        },
        lawyer: {
          specializationIds: value.specializationIds,
          ...(value.newPracticeArea.trim() && {
            newPracticeArea: value.newPracticeArea.trim(),
          }),
          licenseNumber: value.licenseNumber.trim(),
          qualifications: value.qualifications.trim(),
          experienceYears: Number(value.experienceYears),
          contactNumber: value.phone.trim(),
          address: value.address.trim(),
          consultationFee: value.consultationFee.trim()
            ? Number(value.consultationFee)
            : undefined,
          bio: value.bio.trim(),
        },
        resume: value.resume as File,
        additionalFiles: value.additionalFiles,
      };

      apply(application, {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Server Failure",
              description: "Something went wrong. Please try again",
              type: "error",
            });
            return;
          }

          toast.add({
            title: "Application Submitted",
            description: "Please verify your account",
            type: "success",
          });
          const params = new URLSearchParams({
            email: application.user.email,
          });
          router.push(`/apply/verify-account?${params.toString()}`);
        },
        onError: (err) => {
          toast.add({
            title: "Application failure",
            description: getApiErrorMessage(err),
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-2 border-b border-[#e6ece8] pb-4 text-left">
        <h1 className="text-xl font-semibold tracking-tight text-[#20372b] sm:text-2xl">
          Apply to join Justice Desk
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        noValidate
      >
        <FieldGroup className="gap-5">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="Jane Doe"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 pl-9"
                        autoComplete="name"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="lawyer@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 pl-9"
                        autoComplete="email"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="phone">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Contact number</FieldLabel>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        placeholder="+880 1712 345678"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 pl-9"
                        autoComplete="tel"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="address">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Practice address{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="Law office or chambers address"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 pl-9"
                        autoComplete="street-address"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <form.Field name="specializationIds">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Practice areas</FieldLabel>
                    <div className="space-y-2 rounded-lg border border-input p-3">
                      {specializations.isPending && (
                        <p className="text-sm text-muted-foreground">
                          Loading practice areas...
                        </p>
                      )}
                      {!specializations.isPending &&
                        (specializations.data?.data ?? []).map(
                          (specialization) => (
                            <label
                              key={specialization.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                value={specialization.id}
                                checked={field.state.value.includes(
                                  specialization.id,
                                )}
                                onChange={(event) => {
                                  const next = event.target.checked
                                    ? [...field.state.value, specialization.id]
                                    : field.state.value.filter(
                                        (id) => id !== specialization.id,
                                      );
                                  field.handleChange(next);
                                }}
                              />
                              {specialization.name}
                            </label>
                          ),
                        )}
                      {!specializations.isPending &&
                        (specializations.data?.data ?? []).length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No practice areas are available yet.
                          </p>
                        )}
                    </div>
                    <FieldDescription>
                      Select one or more practice areas.
                    </FieldDescription>
                    {specializations.isError && (
                      <FieldError
                        errors={[
                          {
                            message: getApiErrorMessage(specializations.error),
                          },
                        ]}
                      />
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="newPracticeArea">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    New practice area{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="e.g. Cybercrime law"
                  />
                  <FieldDescription>
                    Use this if your practice area is not listed above.
                  </FieldDescription>
                </Field>
              )}
            </form.Field>

            <form.Field name="licenseNumber">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Lawyer license number
                    </FieldLabel>
                    <div className="relative">
                      <BadgeCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="A-12345"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 pl-9"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="qualifications">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Qualifications</FieldLabel>
                    <div className="relative">
                      <GraduationCap className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="LLB, Bar Council"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 pl-9"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="experienceYears">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Years of experience
                    </FieldLabel>
                    <div className="relative">
                      <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        max={70}
                        inputMode="numeric"
                        placeholder="10"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 pl-9"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <form.Field name="consultationFee">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Consultation fee (BDT){" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>
                    <div className="relative">
                      <Banknote className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        placeholder="1000"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 pl-9"
                      />
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="bio">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Professional bio{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    rows={4}
                    placeholder="Describe your legal experience, practice areas, and approach to client service..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    className="min-h-28 rounded-lg"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <FieldDescription>
                      Shown on your public profile after approval.
                    </FieldDescription>
                    <span className="text-xs text-muted-foreground">
                      {field.state.value.length}/1000
                    </span>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="resume">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const file = field.state.value;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="resume-field">Resume</FieldLabel>
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[#d9e4dc] bg-[#f8faf8] p-3 sm:p-4">
                    <Button
                      render={<label htmlFor="resume-field" />}
                      nativeButton={false}
                      variant="outline"
                    >
                      <FileUp size="4" />
                      Upload resume
                    </Button>
                    <input
                      id="resume-field"
                      type="file"
                      className="sr-only"
                      name={field.name}
                      onChange={(e) => {
                        const selected = e.target.files?.[0] ?? null;

                        field.handleChange(selected);
                        e.target.value = "";
                      }}
                    />
                    {file ? (
                      <span className="inline-flex max-w-full items-center gap-2 rounded-lg bg-muted px-2.5 py-1 text-sm">
                        <FileText className="size-4 shrink-0 text-primary" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          type="button"
                          aria-label="Remove resume"
                          onClick={() => {
                            field.handleChange(null);
                            field.handleBlur();
                          }}
                          className="text-muted-foreground transition-colors hover:text-destructive focus:outline-none"
                        >
                          <X className="size-4" />
                        </button>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX or image up to {MAX_FILE_SIZE} MB
                      </span>
                    )}
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="additionalFiles">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              const files = field.state.value;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="additional-file-field">
                    Additional Files
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[#d9e4dc] bg-[#f8faf8] p-3 sm:p-4">
                    <Button
                      render={<label htmlFor="additional-file-field" />}
                      nativeButton={false}
                      variant="outline"
                    >
                      <Plus size="4" />
                      Add Files
                    </Button>
                    <input
                      id="additional-file-field"
                      type="file"
                      multiple
                      className="sr-only"
                      name={field.name}
                      onChange={(e) => {
                        const incoming = Array.from(e.target.files ?? []);

                        if (incoming.length === 0) {
                          return;
                        }

                        field.handleChange([...files, ...incoming]);
                        e.target.value = "";
                      }}
                    />
                    {files.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {files.length} of {MAX_ADDITIONAL_FILES} added
                      </span>
                    )}
                  </div>
                  {files.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {files.map((file, index) => (
                        <li
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <FileText className="size-4 shrink-0 text-primary" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${file.name}`}
                            onClick={() => {
                              field.handleChange(
                                files.filter((_, i) => i !== index),
                              );
                              field.handleBlur();
                            }}
                            className="text-muted-foreground transition-colors hover:text-destructive focus:outline-none"
                          >
                            <X className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
        <div className="mt-5 flex w-full justify-stretch sm:justify-end">
          <Button
            disabled={applyPending}
            type="submit"
            className="h-10 w-full sm:w-auto sm:min-w-36"
          >
            {applyPending ? (
              <>
                <Spinner /> submitting
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Already an approved lawyer?{" "}
        <Link
          href="/login"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Sign in to your account
        </Link>
        . Clients should use the{" "}
        <Link
          href="/register"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          client registration
        </Link>{" "}
        form instead.
      </p>
    </div>
  );
}
