"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAfter, isBefore, isValid, parseISO } from "date-fns";
import { Check, Search, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  type DataColumn,
  DataTable,
  PageHeading,
  StatusLabel,
} from "@/components/dashboard/data-table";
import LawyerReviewSheet from "@/components/modules/lawyer-approval/lawyer-review-sheet";
import BookAppointmentAction from "@/components/modules/payments/book-appointment-action";
import PayAppointmentAction from "@/components/modules/payments/pay-appointment-action";
import PaymentReturnNotice from "@/components/modules/payments/payment-return-notice";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth.hook";
import {
  useApproveLawyer,
  useGetAllLawyers,
  useGetPublicLawyers,
  useSpecializations,
} from "@/hooks/lawyer.hook";
import { useAvailableSchedules } from "@/hooks/schedule.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  type Appointment,
  justiceService,
  type PaginationMeta,
  type Payment,
  type UserRole,
} from "@/services/justice.service";
import type { Lawyer, Specialization } from "@/types/lawyer.type";
import type { Schedule } from "@/types/schedule.type";

const controlClass =
  "h-10 w-full rounded-md border border-[#d9e2dc] bg-white px-3 text-sm text-[#26382d] outline-none focus:border-[#56826c] focus:ring-2 focus:ring-[#56826c]/15";
const fieldLabel = "mb-1.5 block text-[11px] font-semibold text-[#506057]";

function useRefreshQueries(keys: string[]) {
  const client = useQueryClient();
  return () =>
    keys.forEach((key) => void client.invalidateQueries({ queryKey: [key] }));
}

function useApiMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  queryKeys: string[],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryKeys.forEach(
        (key) => void client.invalidateQueries({ queryKey: [key] }),
      ),
  });
}

function ErrorMessage({ error }: { error: unknown }) {
  return (
    <p role="alert" className="text-sm text-[#985547]">
      {getApiErrorMessage(error)}
    </p>
  );
}

function getMeetingLink(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  if ("meetingLink" in data && typeof data.meetingLink === "string")
    return data.meetingLink;
  if (
    "schedule" in data &&
    data.schedule &&
    typeof data.schedule === "object" &&
    "meetingLink" in data.schedule &&
    typeof data.schedule.meetingLink === "string"
  )
    return data.schedule.meetingLink;
  return undefined;
}

function useSessionRole() {
  const { data } = useCurrentUser();
  return data?.role ?? "CLIENT";
}

export function LawyerDirectoryPage({
  publicView = false,
}: {
  publicView?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [specializationId, setSpecializationId] = useState("");
  const [selectedLawyer, setSelectedLawyer] = useState<string>();
  const specializations = useSpecializations();
  const lawyers = useGetPublicLawyers({
    page: 1,
    limit: 100,
    ...(search ? { searchTerm: search } : {}),
    sortBy,
    sortOrder,
  });
  const schedules = useAvailableSchedules(
    { page: 1, limit: 20, lawyerId: selectedLawyer },
    Boolean(selectedLawyer),
  );
  const rows = (lawyers.data?.data ?? []).filter(
    (lawyer) =>
      !specializationId ||
      lawyer.specializations?.some(
        ({ specialization }) => specialization.id === specializationId,
      ),
  );
  return (
    <div className="mx-auto max-w-6xl px-5 py-5">
      <PageHeading
        eyebrow="Find Lawyer"
        title="Find a lawyer"
        description="Browse public profiles and available appointment schedules returned by Justice Desk."
      />
      <div className="mb-5 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <label className="sr-only" htmlFor="lawyer-search">
            Search lawyers
          </label>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#839087]"
          />
          <input
            id="lawyer-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by lawyer or qualification"
            className={`${controlClass} pl-9`}
          />
        </div>
        <label className="sr-only" htmlFor="lawyer-specialization">
          Filter by practice area
        </label>
        <select
          id="lawyer-specialization"
          value={specializationId}
          onChange={(event) => setSpecializationId(event.target.value)}
          className={controlClass}
        >
          <option value="">All practice areas</option>
          {(specializations.data?.data ?? []).map((specialization) => (
            <option key={specialization.id} value={specialization.id}>
              {specialization.name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="lawyer-sort">
          Sort lawyers
        </label>
        <select
          id="lawyer-sort"
          value={`${sortBy}:${sortOrder}`}
          onChange={(event) => {
            const [nextSortBy, nextSortOrder] = event.target.value.split(":");
            setSortBy(nextSortBy);
            setSortOrder(nextSortOrder as "asc" | "desc");
          }}
          className={controlClass}
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="name:asc">Name A-Z</option>
          <option value="name:desc">Name Z-A</option>
          <option value="consultationFee:asc">Lowest fee</option>
          <option value="consultationFee:desc">Highest fee</option>
        </select>
      </div>
      {lawyers.isError && <ErrorMessage error={lawyers.error} />}
      {lawyers.isPending ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-44 animate-pulse rounded-xl border border-[#e0e7e2] bg-white"
            />
          ))}
        </div>
      ) : null}
      {!lawyers.isPending && rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d5dfd8] bg-white px-5 py-14 text-center text-sm text-[#78857d]">
          No public lawyers match this search.
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((lawyer) => (
          <article
            key={lawyer.id}
            className="rounded-xl border border-[#dfe6e2] bg-white p-4 shadow-[0_8px_28px_-24px_rgba(23,61,48,0.28)] transition-shadow hover:shadow-[0_12px_32px_-24px_rgba(23,61,48,0.38)]"
          >
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8f0ea] text-sm font-semibold text-[#315b43]">
                {lawyer.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-[#24382c]">
                  {lawyer.name}
                </h2>
                <p className="mt-1 text-xs text-[#7c8981]">
                  {lawyer.qualifications ?? "Legal counsel"}
                  {lawyer.experienceYears !== undefined
                    ? ` · ${lawyer.experienceYears} yrs`
                    : ""}
                </p>
                <p className="mt-1 text-[10px] font-medium text-[#39715d]">
                  Approved
                </p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-[#69766e]">
              {lawyer.bio || "Review this lawyer's public profile."}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lawyer.specializations?.slice(0, 3).map(({ specialization }) => (
                <span
                  key={specialization.id}
                  className="rounded-sm bg-[#eef3ef] px-2 py-1 text-[10px] text-[#4e6958]"
                >
                  {specialization.name}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#edf1ee] pt-3">
              <span className="text-xs font-semibold text-[#315744]">
                {lawyer.consultationFee
                  ? `BDT ${lawyer.consultationFee}`
                  : "Fee not listed"}
              </span>
              <button
                type="button"
                onClick={() =>
                  setSelectedLawyer(
                    selectedLawyer === lawyer.id ? undefined : lawyer.id,
                  )
                }
                className="text-xs font-semibold text-[#39715d] hover:underline"
              >
                {selectedLawyer === lawyer.id
                  ? "Hide schedules"
                  : "View schedules"}
              </button>
            </div>
            {selectedLawyer === lawyer.id && (
              <div className="mt-3 border-t border-[#edf1ee] pt-3">
                {schedules.isPending ? (
                  <p className="text-xs text-[#7a867f]">
                    Checking availability...
                  </p>
                ) : null}
                {schedules.isError ? (
                  <ErrorMessage error={schedules.error} />
                ) : null}
                {!schedules.isPending &&
                (schedules.data?.data.data ?? []).filter(
                  (schedule) =>
                    schedule.lawyer?.id === lawyer.id ||
                    schedule.lawyerId === lawyer.id,
                ).length === 0 ? (
                  <p className="text-xs text-[#7a867f]">
                    No available schedules returned for this lawyer.
                  </p>
                ) : null}
                <div className="space-y-2">
                  {(schedules.data?.data.data ?? [])
                    .filter(
                      (schedule) =>
                        schedule.lawyer?.id === lawyer.id ||
                        schedule.lawyerId === lawyer.id,
                    )
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#e5ebe7] bg-[#fbfcfb] px-3 py-2.5"
                      >
                        <div>
                          <p className="text-xs font-medium text-[#38483e]">
                            {new Date(schedule.startDateTime).toLocaleString()}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#819087]">
                            {schedule.availableSlots} of {schedule.totalSlots}{" "}
                            spaces
                          </p>
                        </div>
                        {publicView ? (
                          <Link
                            href={`/login?next=${encodeURIComponent("/client/lawyers")}`}
                            className="text-xs font-semibold text-[#39715d] hover:underline"
                          >
                            Sign in to book
                          </Link>
                        ) : (
                          <BookAppointmentAction
                            scheduleId={schedule.id}
                            disabled={schedule.availableSlots < 1}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
      {lawyers.data?.meta && (
        <p className="mt-4 text-right text-[10px] text-[#89948d]">
          Showing {rows.length} of {lawyers.data.meta.total} lawyers
        </p>
      )}
    </div>
  );
}

export function AppointmentsPage({ accountRole }: { accountRole: UserRole }) {
  const role = accountRole;
  const appointmentRouteRole =
    role === "SUPER_ADMIN" || role === "ADMIN" ? "admin" : role.toLowerCase();
  const [page, setPage] = useState(1);
  const queries = useQuery({
    queryKey: ["appointments", role, page],
    queryFn: () =>
      role === "ADMIN" || role === "SUPER_ADMIN"
        ? justiceService.allAppointments({ page, limit: 10 })
        : justiceService.appointments(role, { page, limit: 10 }),
  });
  const invalidate = useRefreshQueries([
    "appointments",
    "overview-appointments",
    "overview-payments",
  ]);
  const mutation = useMutation({
    mutationFn: async ({
      action,
      appointment,
    }: {
      action: "cancel" | "join" | "ongoing" | "complete";
      appointment: Appointment;
    }) => {
      if (action === "cancel")
        return justiceService.cancelAppointment(appointment.id);
      if (action === "join")
        return justiceService.joinAppointment(appointment.id);
      return justiceService.updateAppointmentStatus(
        appointment.id,
        action === "ongoing" ? "ONGOING" : "COMPLETED",
      );
    },
  });
  const perform = (
    action: "cancel" | "join" | "ongoing" | "complete",
    appointment: Appointment,
  ) => {
    const meetingWindow =
      action === "join" ? window.open("about:blank", "_blank") : null;
    if (meetingWindow) meetingWindow.opener = null;

    mutation.mutate(
      { action, appointment },
      {
        onSuccess: (response) => {
          invalidate();
          if (action === "join") {
            const meetingLink = getMeetingLink(response.data);
            if (!meetingLink) {
              meetingWindow?.close();
              toast.error(
                "The appointment response did not include a meeting link.",
              );
              return;
            }

            let meetingUrl: URL;
            try {
              meetingUrl = new URL(meetingLink);
            } catch {
              meetingWindow?.close();
              toast.error("The appointment returned an invalid meeting link.");
              return;
            }
            if (!["http:", "https:"].includes(meetingUrl.protocol)) {
              meetingWindow?.close();
              toast.error("The appointment returned an invalid meeting link.");
              return;
            }
            if (!meetingWindow) {
              toast.error(
                "Your browser blocked the meeting tab. Allow pop-ups and try joining again.",
              );
              return;
            }
            meetingWindow.location.href = meetingUrl.href;
            toast.success("Appointment joined");
            return;
          }

          const paymentUrl =
            "data" in response &&
            response.data &&
            typeof response.data === "object" &&
            "paymentUrl" in response.data
              ? response.data.paymentUrl
              : undefined;
          if (typeof paymentUrl === "string")
            window.location.assign(paymentUrl);
          else
            toast.success(
              action === "cancel"
                ? "Appointment cancelled"
                : "Appointment updated",
            );
        },
        onError: (error) => {
          meetingWindow?.close();
          toast.error(getApiErrorMessage(error));
        },
      },
    );
  };

  const rows = queries.data?.data ?? [];
  const columns = [
    {
      key: "date",
      label: "Appointment",
      render: (item: Appointment) => (
        <>
          <span className="block font-medium">
            {item.schedule?.startDateTime
              ? new Date(item.schedule.startDateTime).toLocaleDateString()
              : "Schedule pending"}
          </span>
          <span className="mt-1 block text-[11px] text-[#839087]">
            {item.schedule?.startDateTime
              ? new Date(item.schedule.startDateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : item.id.slice(0, 8)}
          </span>
        </>
      ),
    },
    {
      key: "counterparty",
      label:
        role === "CLIENT"
          ? "Lawyer"
          : role === "LAWYER"
            ? "Client"
            : "Participants",
      render: (item: Appointment) =>
        role === "CLIENT"
          ? (item.lawyer?.name ?? "Counsel")
          : role === "LAWYER"
            ? (item.client?.name ?? "Client")
            : `${item.client?.name ?? "Client"} · ${item.lawyer?.name ?? "Counsel"}`,
    },
    {
      key: "serial",
      label: "Serial",
      render: (item: Appointment) =>
        item.serialNumber ? `#${item.serialNumber}` : "Assigned after payment",
    },
    {
      key: "payment",
      label: "Payment",
      render: (item: Appointment) =>
        item.payment ? (
          <span>
            {item.payment.paymentGateway} ·{" "}
            <StatusLabel>{item.payment.status}</StatusLabel>
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: Appointment) => <StatusLabel>{item.status}</StatusLabel>,
    },
    {
      key: "action",
      label: "Action",
      render: (item: Appointment) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {role === "CLIENT" &&
            item.status === "PENDING" &&
            item.payment?.status !== "PAID" && (
              <PayAppointmentAction appointmentId={item.id} />
            )}
          {role === "CLIENT" &&
            (item.status === "CONFIRMED" || item.status === "ONGOING") && (
              <SmallAction
                onClick={() => perform("join", item)}
                disabled={mutation.isPending || !isInSchedule(item.schedule)}
              >
                Join
              </SmallAction>
            )}
          {role === "CLIENT" &&
            !["CANCELLED", "COMPLETED", "ONGOING"].includes(item.status) && (
              <SmallAction
                onClick={() => perform("cancel", item)}
                disabled={mutation.isPending}
              >
                Cancel
              </SmallAction>
            )}
          {(role === "ADMIN" || role === "SUPER_ADMIN") &&
            !["CANCELLED", "COMPLETED"].includes(item.status) && (
              <SmallAction
                onClick={() => perform("cancel", item)}
                disabled={mutation.isPending}
              >
                Cancel
              </SmallAction>
            )}
          {role === "LAWYER" && item.status === "CONFIRMED" && (
            <SmallAction
              onClick={() => perform("ongoing", item)}
              disabled={mutation.isPending || !isInSchedule(item.schedule)}
            >
              Start
            </SmallAction>
          )}
          {role === "LAWYER" && item.status === "ONGOING" && (
            <SmallAction
              onClick={() => perform("complete", item)}
              disabled={mutation.isPending}
            >
              Complete
            </SmallAction>
          )}
          <Link
            href={`/${appointmentRouteRole}/appointments/${item.id}`}
            className="px-2 py-1 text-[10px] font-semibold text-[#39715d] hover:underline"
          >
            Details
          </Link>
        </div>
      ),
    },
  ];
  return (
    <div>
      <PageHeading
        eyebrow="Scheduling"
        title="Appointments"
        description={
          role === "ADMIN" || role === "SUPER_ADMIN"
            ? "All client and lawyer appointments, including booking and payment status."
            : "Bookings, serial numbers, payment states, and appointment actions from the service."
        }
      />
      <PaymentReturnNotice />
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={queries.isPending}
        error={queries.isError ? getApiErrorMessage(queries.error) : undefined}
        emptyTitle="No appointments found"
        emptyDescription="Appointment records will appear here after a booking is started."
      />
      <HistoryPagination
        page={page}
        meta={queries.data?.meta}
        isLoading={queries.isFetching}
        onPageChange={setPage}
      />
    </div>
  );
}

function SmallAction({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className="h-7 rounded border-[#cad9cf] px-2 text-[10px] text-[#315744]"
    >
      {children}
    </Button>
  );
}

function isInSchedule(schedule?: Schedule) {
  if (!schedule) return false;
  const now = new Date();
  const start = parseISO(schedule.startDateTime);
  const end = parseISO(schedule.endDateTime);
  return (
    isValid(start) &&
    isValid(end) &&
    !isBefore(now, start) &&
    !isAfter(now, end)
  );
}

function HistoryPagination({
  page,
  meta,
  isLoading,
  onPageChange,
}: {
  page: number;
  meta?: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  if (!meta) return null;

  const firstRecord = meta.total === 0 ? 0 : (page - 1) * meta.limit + 1;
  const lastRecord = Math.min(page * meta.limit, meta.total);

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#748178]">
      <p>
        Showing {firstRecord}–{lastRecord} of {meta.total} records
      </p>
      {meta.totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isLoading || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {meta.totalPages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isLoading || page >= meta.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export function PaymentsPage({ accountRole }: { accountRole: UserRole }) {
  const [page, setPage] = useState(1);
  const payments = useQuery({
    queryKey: ["payments", accountRole, page],
    queryFn: () =>
      accountRole === "ADMIN" || accountRole === "SUPER_ADMIN"
        ? justiceService.allPayments({ page, limit: 10 })
        : justiceService.payments(accountRole, { page, limit: 10 }),
  });
  const rows = payments.data?.data ?? [];
  const columns = [
    {
      key: "date",
      label: "Date",
      render: (item: Payment) =>
        item.paidAt
          ? new Date(item.paidAt).toLocaleDateString()
          : item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "—",
    },
    {
      key: "amount",
      label: "Amount",
      render: (item: Payment) =>
        `${item.currency} ${Number(item.amount).toLocaleString()}`,
    },
    {
      key: "gateway",
      label: "Gateway",
      render: (item: Payment) => item.paymentGateway,
    },
    {
      key: "gatewayReference",
      label: "Payment intent / transaction ID",
      render: (item: Payment) => {
        const reference =
          item.paymentGateway === "STRIPE"
            ? (item.stripePaymentIntentId ?? item.stripeSessionId)
            : (item.bkashTrxId ?? item.bkashPaymentId);

        return reference ?? item.merchantInvoiceNumber ?? "Pending";
      },
    },
    {
      key: "reference",
      label: "Appointment",
      render: (item: Payment) =>
        item.appointment?.id ? (
          <div>
            <Link
              href={`/${accountRole.toLowerCase()}/appointments/${item.appointment.id}`}
              className="text-[#39715d] hover:underline"
            >
              {item.appointment.id.slice(0, 8)}
            </Link>
            <span className="mt-1 block text-[10px] text-[#839087]">
              {item.appointment.client?.name ?? "Client not listed"} ·{" "}
              {item.appointment.lawyer?.name ?? "Lawyer not listed"}
            </span>
            {item.appointment.schedule?.startDateTime && (
              <span className="mt-1 block text-[10px] text-[#839087]">
                {new Date(
                  item.appointment.schedule.startDateTime,
                ).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: Payment) => <StatusLabel>{item.status}</StatusLabel>,
    },
  ];
  return (
    <div>
      <PageHeading
        eyebrow="Billing"
        title="Payments"
        description={
          accountRole === "ADMIN" || accountRole === "SUPER_ADMIN"
            ? "Payment history across all accounts, with gateway and payment status."
            : "Your payment history and gateway status."
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={payments.isPending}
        error={
          payments.isError ? getApiErrorMessage(payments.error) : undefined
        }
        emptyTitle="No payment records"
        emptyDescription="A payment record appears after an appointment payment is initiated."
      />
      <HistoryPagination
        page={page}
        meta={payments.data?.meta}
        isLoading={payments.isFetching}
        onPageChange={setPage}
      />
      <p className="mt-3 text-[10px] text-[#87938c]">
        Payments are initiated and confirmed by the configured Stripe or bKash
        service.
      </p>
    </div>
  );
}

export function LawyerReviewPage() {
  const [showApplications, setShowApplications] = useState(false);
  const lawyerParams = {
    page: 1,
    limit: 100,
    ...(showApplications ? { verificationStatus: "PENDING" as const } : {}),
  };
  const lawyers = useGetAllLawyers(lawyerParams);
  const pendingApplications = useGetAllLawyers({
    page: 1,
    limit: 1,
    verificationStatus: "PENDING",
  });
  const reviewMutation = useApproveLawyer();
  const [rejectionId, setRejectionId] = useState<string>();
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>();
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string>();
  const rows = lawyers.data?.data ?? [];
  async function review(lawyer: Lawyer, status: "APPROVED" | "REJECTED") {
    if (
      status === "REJECTED" &&
      (reason.trim().length < 3 || reason.trim().length > 500)
    ) {
      toast.error("Enter a rejection reason between 3 and 500 characters.");
      return;
    }
    setBusyId(lawyer.id);
    try {
      await reviewMutation.mutateAsync({
        lawyerId: lawyer.id,
        verificationStatus: status,
        ...(status === "REJECTED" ? { rejectionReason: reason.trim() } : {}),
      });
      toast.success(
        status === "APPROVED" ? "Lawyer approved" : "Application rejected",
      );
      setRejectionId(undefined);
      setReason("");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusyId(undefined);
    }
  }
  const columns = [
    {
      key: "name",
      label: "Applicant",
      render: (item: Lawyer) => (
        <>
          <span className="block font-semibold">{item.name}</span>
          <span className="mt-1 block text-[11px] text-[#829087]">
            {item.user?.email ?? "—"}
          </span>
        </>
      ),
    },
    {
      key: "license",
      label: "License",
      render: (item: Lawyer) => item.licenseNumber ?? "—",
    },
    {
      key: "qualifications",
      label: "Qualifications",
      render: (item: Lawyer) => item.qualifications ?? "—",
    },
    {
      key: "experience",
      label: "Experience",
      render: (item: Lawyer) =>
        item.experienceYears === undefined
          ? "—"
          : `${item.experienceYears} years`,
    },
    {
      key: "action",
      label: "Review",
      render: (item: Lawyer) => (
        <div className="flex flex-wrap gap-1.5">
          {item.verificationStatus === "PENDING" && (
            <SmallAction
              disabled={busyId === item.id || !item.user?.emailVerified}
              onClick={() => review(item, "APPROVED")}
            >
              <Check size={12} />{" "}
              {item.user?.emailVerified ? "Approve" : "Email not verified"}
            </SmallAction>
          )}
          <SmallAction onClick={() => setSelectedLawyerId(item.id)}>
            Details
          </SmallAction>
          {item.verificationStatus === "PENDING" && (
            <SmallAction
              disabled={busyId === item.id || !item.user?.emailVerified}
              onClick={() => {
                setRejectionId(rejectionId === item.id ? undefined : item.id);
                setReason("");
              }}
            >
              <X size={12} /> Reject
            </SmallAction>
          )}
        </div>
      ),
    },
  ];
  return (
    <div>
      <PageHeading
        eyebrow="Administration"
        title="Lawyers Panel"
        description={
          showApplications
            ? "Review pending lawyer applications."
            : "View all lawyers and their current verification status."
        }
      />
      <div className="mb-4 flex gap-2">
        <Button
          type="button"
          variant={showApplications ? "outline" : "default"}
          onClick={() => {
            setShowApplications(false);
            setRejectionId(undefined);
          }}
        >
          All lawyers
        </Button>
        <Button
          type="button"
          variant={showApplications ? "default" : "outline"}
          onClick={() => {
            setShowApplications(true);
            setRejectionId(undefined);
          }}
        >
          <span>Lawyer applications</span>
          <span
            title={`${pendingApplications.data?.meta?.total ?? 0} pending applications`}
            className="ml-1 grid min-w-5 place-items-center rounded-full bg-[#9a4f42] px-1.5 py-0.5 text-[10px] leading-none text-white"
          >
            {pendingApplications.data?.meta?.total ?? 0}
          </span>
        </Button>
      </div>
      {rejectionId && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const lawyer = rows.find((item) => item.id === rejectionId);
            if (lawyer) void review(lawyer, "REJECTED");
          }}
          className="mb-4 flex flex-col gap-2 rounded-xl border border-[#ead8d3] bg-[#fffaf8] p-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className={fieldLabel} htmlFor="reject-reason">
              Reason for rejection *
            </label>
            <input
              id="reject-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className={controlClass}
            />
          </div>
          <Button
            disabled={busyId === rejectionId}
            className="bg-[#9a4f42] text-white"
          >
            Confirm rejection
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRejectionId(undefined)}
          >
            Cancel
          </Button>
        </form>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={lawyers.isPending}
        error={lawyers.isError ? getApiErrorMessage(lawyers.error) : undefined}
        emptyTitle={
          showApplications ? "No pending applications" : "No lawyers found"
        }
        emptyDescription={
          showApplications
            ? "There are no pending lawyer applications in the current response."
            : "No lawyers were returned by the management endpoint."
        }
      />
      {selectedLawyerId && (
        <LawyerReviewSheet
          selectedId={selectedLawyerId}
          onClose={() => setSelectedLawyerId(undefined)}
          {...lawyerParams}
        />
      )}
    </div>
  );
}

export function SpecializationsPage() {
  const role = useSessionRole();
  const specializations = useQuery({
    queryKey: ["specializations"],
    queryFn: () => justiceService.specializations(),
  });
  const requests = useQuery({
    queryKey: ["specialization-requests"],
    queryFn: () => justiceService.specializationRequests(),
    enabled: role === "ADMIN" || role === "SUPER_ADMIN",
  });
  const invalidate = useRefreshQueries([
    "specializations",
    "specialization-requests",
  ]);
  const createMutation = useApiMutation(justiceService.createSpecialization, [
    "specializations",
  ]);
  const updateMutation = useApiMutation(
    ({
      id,
      body,
    }: {
      id: string;
      body: { name: string; description: string };
    }) => justiceService.updateSpecialization(id, body),
    ["specializations"],
  );
  const reviewMutation = useApiMutation(justiceService.reviewSpecialization, [
    "specialization-requests",
  ]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingSpecialization, setEditingSpecialization] =
    useState<Specialization | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [rejectionRequestId, setRejectionRequestId] = useState<string>();
  const [rejectionReason, setRejectionReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
      });
      toast.success("Specialization created");
      setName("");
      setDescription("");
      invalidate();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }
  async function updateSpecialization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSpecialization) return;
    setUpdateError("");
    try {
      await updateMutation.mutateAsync({
        id: editingSpecialization.id,
        body: { name: editName.trim(), description: editDescription.trim() },
      });
      toast.success("Specialization updated");
      setEditingSpecialization(null);
      invalidate();
    } catch (caught) {
      setUpdateError(getApiErrorMessage(caught));
    }
  }
  type SpecializationRequestRow = Record<string, unknown> & { id: string };
  const requestRows: SpecializationRequestRow[] = (requests.data?.data ?? [])
    .filter(
      (value): value is Record<string, unknown> =>
        typeof value === "object" && value !== null && "id" in value,
    )
    .map((value) => ({
      ...value,
      id: String(value.id),
      status: String(value.status ?? "PENDING"),
    }));
  const requestColumns: DataColumn<SpecializationRequestRow>[] = [
    {
      key: "lawyer",
      label: "Lawyer",
      render: (item: Record<string, unknown>) => {
        const lawyer = item.lawyer as
          | { name?: string; email?: string }
          | undefined;
        return lawyer?.name ?? lawyer?.email ?? "Lawyer";
      },
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (item: Record<string, unknown>) => {
        const spec = item.specialization as { name?: string } | undefined;
        return (
          spec?.name ??
          (typeof item.newPracticeArea === "string"
            ? item.newPracticeArea
            : "Requested specialization")
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (item: Record<string, unknown>) => (
        <StatusLabel>{String(item.status)}</StatusLabel>
      ),
    },
    {
      key: "action",
      label: "Review",
      render: (item: Record<string, unknown>) => {
        const requestId = String(item.id);
        if (item.status !== "PENDING") return "—";

        if (rejectionRequestId === requestId) {
          return (
            <div className="flex min-w-56 flex-col gap-2">
              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Reason for rejection"
                rows={2}
                maxLength={500}
                className="w-full rounded-md border border-[#d9e2dc] bg-white px-2 py-1.5 text-xs outline-none focus:border-[#56826c] focus:ring-2 focus:ring-[#56826c]/15"
              />
              <div className="flex gap-2">
                <SmallAction
                  disabled={rejectionReason.trim().length < 3}
                  onClick={() =>
                    void reviewRequest(requestId, "REJECTED", rejectionReason)
                  }
                >
                  Confirm
                </SmallAction>
                <SmallAction
                  onClick={() => {
                    setRejectionRequestId(undefined);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </SmallAction>
              </div>
            </div>
          );
        }

        return (
          <div className="flex gap-2">
            <SmallAction
              onClick={() => void reviewRequest(requestId, "APPROVED")}
            >
              Approve
            </SmallAction>
            <SmallAction
              onClick={() => {
                setRejectionRequestId(requestId);
                setRejectionReason("");
              }}
            >
              Reject
            </SmallAction>
          </div>
        );
      },
    },
  ];
  async function reviewRequest(
    requestId: string,
    status: "APPROVED" | "REJECTED",
    reason?: string,
  ) {
    try {
      await reviewMutation.mutateAsync({
        requestId,
        status,
        ...(status === "REJECTED" && { rejectionReason: reason?.trim() }),
      });
      toast.success(`Request ${status.toLowerCase()}`);
      setRejectionRequestId(undefined);
      setRejectionReason("");
      invalidate();
    } catch (caught) {
      toast.error(getApiErrorMessage(caught));
    }
  }
  const specializationColumns: DataColumn<Specialization>[] = [
    {
      key: "name",
      label: "Practice area",
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: "description",
      label: "Description",
      render: (item) => item.description ?? "—",
    },
  ];
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    specializationColumns.push({
      key: "actions",
      label: "Actions",
      render: (item) => (
        <SmallAction
          onClick={() => {
            setEditingSpecialization(item);
            setEditName(item.name);
            setEditDescription(item.description ?? "");
            setUpdateError("");
          }}
        >
          Update
        </SmallAction>
      ),
    });
  }
  return (
    <div>
      <PageHeading
        eyebrow="Administration"
        title="Specializations"
        description="Practice areas and lawyer specialization requests supported by the service."
      />
      {(role === "ADMIN" || role === "SUPER_ADMIN") && (
        <form
          onSubmit={create}
          className="mb-5 grid gap-3 rounded-xl border border-[#dfe6e2] bg-white p-4 shadow-sm sm:grid-cols-[1fr_2fr_auto]"
        >
          <div>
            <label className={fieldLabel} htmlFor="specialization-name">
              New practice area
            </label>
            <input
              required
              id="specialization-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="specialization-description">
              Description
            </label>
            <input
              id="specialization-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={controlClass}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={busy}
              className="h-10 bg-[#174638] text-white"
            >
              Add
            </Button>
          </div>
          {error && (
            <p className="text-xs text-[#985547] sm:col-span-3">{error}</p>
          )}
        </form>
      )}
      {editingSpecialization && (
        <form
          onSubmit={updateSpecialization}
          className="mb-5 grid gap-3 rounded-xl border border-[#dfe6e2] bg-white p-4 shadow-sm sm:grid-cols-[1fr_2fr_auto]"
        >
          <div>
            <label className={fieldLabel} htmlFor="edit-specialization-name">
              Practice area
            </label>
            <input
              required
              id="edit-specialization-name"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              className={controlClass}
            />
          </div>
          <div>
            <label
              className={fieldLabel}
              htmlFor="edit-specialization-description"
            >
              Description
            </label>
            <input
              id="edit-specialization-description"
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              className={controlClass}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingSpecialization(null)}
              disabled={updateMutation.isPending}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="h-10 bg-[#174638] text-white"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          {updateError && (
            <p role="alert" className="text-xs text-[#985547] sm:col-span-3">
              {updateError}
            </p>
          )}
        </form>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#293d31]">
            Practice areas
          </h2>
          <DataTable
            columns={specializationColumns}
            rows={specializations.data?.data ?? []}
            isLoading={specializations.isPending}
            error={
              specializations.isError
                ? getApiErrorMessage(specializations.error)
                : undefined
            }
            emptyTitle="No specializations"
          />
        </section>
        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-[#293d31]">
              Specialization requests
            </h2>
            <DataTable
              columns={requestColumns}
              rows={requestRows}
              isLoading={requests.isPending}
              error={
                requests.isError
                  ? getApiErrorMessage(requests.error)
                  : undefined
              }
              emptyTitle="No specialization requests"
            />
          </section>
        )}
      </div>
    </div>
  );
}
