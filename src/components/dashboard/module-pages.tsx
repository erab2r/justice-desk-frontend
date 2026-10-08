"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAfter, isBefore, isValid, parseISO } from "date-fns";
import { ArrowDownToLine, Check, Search, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  type DataColumn,
  DataTable,
  PageHeading,
  StatusLabel,
} from "@/components/dashboard/data-table";
import BookAppointmentAction from "@/components/modules/payments/book-appointment-action";
import PayAppointmentAction from "@/components/modules/payments/pay-appointment-action";
import PaymentReturnNotice from "@/components/modules/payments/payment-return-notice";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth.hook";
import {
  useApproveLawyer,
  useGetAllLawyers,
  useGetPublicLawyers,
} from "@/hooks/lawyer.hook";
import { useAvailableSchedules } from "@/hooks/schedule.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  type Appointment,
  type Invoice,
  justiceService,
  type Payment,
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

export function LawyerDirectoryPage() {
  const [search, setSearch] = useState("");
  const [selectedLawyer, setSelectedLawyer] = useState<string>();
  const lawyers = useGetPublicLawyers({
    page: 1,
    limit: 24,
    ...(search ? { searchTerm: search } : {}),
  });
  const schedules = useAvailableSchedules(
    { page: 1, limit: 20, lawyerId: selectedLawyer },
    Boolean(selectedLawyer),
  );
  const rows = lawyers.data?.data ?? [];
  return (
    <div>
      <PageHeading
        eyebrow="Find counsel"
        title="Lawyer directory"
        description="Browse public profiles and available appointment schedules returned by Justice Desk."
      />
      <div className="relative mb-5 block max-w-sm">
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
      {lawyers.isError && <ErrorMessage error={lawyers.error} />}
      {lawyers.isPending ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-44 animate-pulse border border-[#e0e7e2] bg-white"
            />
          ))}
        </div>
      ) : null}
      {!lawyers.isPending && rows.length === 0 ? (
        <div className="border border-dashed border-[#d5dfd8] bg-white px-5 py-14 text-center text-sm text-[#78857d]">
          No public lawyers match this search.
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((lawyer) => (
          <article
            key={lawyer.id}
            className="border border-[#dfe6e2] bg-white p-4"
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
                        className="flex items-center justify-between gap-3 rounded border border-[#e5ebe7] px-2.5 py-2"
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
                        <BookAppointmentAction
                          scheduleId={schedule.id}
                          disabled={schedule.availableSlots < 1}
                        />
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

export function AppointmentsPage() {
  const role = useSessionRole();
  const appointmentRouteRole =
    role === "SUPER_ADMIN" || role === "ADMIN" ? "admin" : role.toLowerCase();
  const queries = useQuery({
    queryKey: ["appointments", role],
    queryFn: () => justiceService.appointments(role, { page: 1, limit: 50 }),
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
        description="Bookings, serial numbers, payment states, and appointment actions from the service."
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
      {queries.data?.meta && (
        <p className="mt-3 text-right text-[10px] text-[#89948d]">
          Page {queries.data.meta.page} · {queries.data.meta.total} total
          records
        </p>
      )}
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

export function PaymentsPage() {
  const role = useSessionRole();
  const payments = useQuery({
    queryKey: ["payments", role],
    queryFn: () => justiceService.payments(role, { page: 1, limit: 50 }),
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
      key: "reference",
      label: "Appointment",
      render: (item: Payment) =>
        item.appointment?.id ? (
          <Link
            href={`/${role.toLowerCase()}/appointments/${item.appointment.id}`}
            className="text-[#39715d] hover:underline"
          >
            {item.appointment.id.slice(0, 8)}
          </Link>
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
        description="Payment records and gateway status returned for your account."
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
      <p className="mt-3 text-[10px] text-[#87938c]">
        Payments are initiated and confirmed by the configured Stripe or bKash
        service.
      </p>
    </div>
  );
}

export function InvoicesPage() {
  const role = useSessionRole();
  const invoices = useQuery({
    queryKey: ["invoices", role],
    queryFn: () => justiceService.invoices(role, { page: 1, limit: 50 }),
  });
  const rows = invoices.data?.data ?? [];
  const columns = [
    {
      key: "number",
      label: "Invoice",
      render: (item: Invoice) => (
        <span className="font-semibold">{item.invoiceNumber}</span>
      ),
    },
    {
      key: "case",
      label: "Case",
      render: (item: Invoice) => item.case?.caseNumber ?? "—",
    },
    {
      key: "date",
      label: "Issued",
      render: (item: Invoice) =>
        new Date(item.invoiceDate).toLocaleDateString(),
    },
    {
      key: "due",
      label: "Due",
      render: (item: Invoice) =>
        item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—",
    },
    {
      key: "total",
      label: "Total",
      render: (item: Invoice) =>
        `${item.currency} ${Number(item.totalAmount).toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (item: Invoice) => <StatusLabel>{item.status}</StatusLabel>,
    },
    {
      key: "pdf",
      label: "Document",
      render: (item: Invoice) =>
        item.pdfUrl ? (
          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open invoice ${item.invoiceNumber}`}
            className="inline-flex items-center gap-1 text-xs text-[#39715d] hover:underline"
          >
            <ArrowDownToLine size={14} /> PDF
          </a>
        ) : (
          "—"
        ),
    },
  ];
  return (
    <div>
      <PageHeading
        eyebrow="Billing"
        title="Invoices"
        description="Invoice details, due dates, statuses, and available PDF documents."
      />
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={invoices.isPending}
        error={
          invoices.isError ? getApiErrorMessage(invoices.error) : undefined
        }
        emptyTitle="No invoices found"
        emptyDescription="Invoices associated with your cases will appear here."
      />
    </div>
  );
}

export function LawyerReviewPage() {
  const lawyers = useGetAllLawyers({ page: 1, limit: 100 });
  const reviewMutation = useApproveLawyer();
  const [rejectionId, setRejectionId] = useState<string>();
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string>();
  const rows = (lawyers.data?.data ?? []).filter(
    (lawyer) => lawyer.verificationStatus === "PENDING",
  );
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
          <SmallAction
            disabled={busyId === item.id}
            onClick={() => review(item, "APPROVED")}
          >
            <Check size={12} /> Approve
          </SmallAction>
          <SmallAction
            disabled={busyId === item.id}
            onClick={() => {
              setRejectionId(rejectionId === item.id ? undefined : item.id);
              setReason("");
            }}
          >
            <X size={12} /> Reject
          </SmallAction>
        </div>
      ),
    },
  ];
  return (
    <div>
      <PageHeading
        eyebrow="Administration"
        title="Lawyer applications"
        description="Pending applicants returned by the lawyer management endpoint."
      />
      {rejectionId && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const lawyer = rows.find((item) => item.id === rejectionId);
            if (lawyer) void review(lawyer, "REJECTED");
          }}
          className="mb-4 flex flex-col gap-2 border border-[#ead8d3] bg-[#fffaf8] p-4 sm:flex-row sm:items-end"
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
        emptyTitle="No pending applications"
        emptyDescription="There are no pending lawyer applications in the current response."
      />
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
  const requestRows = (requests.data?.data ?? [])
    .filter(
      (value): value is Record<string, unknown> =>
        typeof value === "object" && value !== null && "id" in value,
    )
    .map((value) => ({
      ...value,
      id: String(value.id),
      status: String(value.status ?? "PENDING"),
    }));
  const requestColumns = [
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
        return spec?.name ?? "Requested specialization";
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
      render: (item: Record<string, unknown>) =>
        item.status === "PENDING" ? (
          <div className="flex gap-2">
            <SmallAction
              onClick={() => void reviewRequest(String(item.id), "APPROVED")}
            >
              Approve
            </SmallAction>
            <SmallAction
              onClick={() => void reviewRequest(String(item.id), "REJECTED")}
            >
              Reject
            </SmallAction>
          </div>
        ) : (
          "—"
        ),
    },
  ];
  async function reviewRequest(
    requestId: string,
    status: "APPROVED" | "REJECTED",
  ) {
    try {
      await reviewMutation.mutateAsync({ requestId, status });
      toast.success(`Request ${status.toLowerCase()}`);
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
          className="mb-5 grid gap-3 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-[1fr_2fr_auto]"
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
          className="mb-5 grid gap-3 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-[1fr_2fr_auto]"
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
              Lawyer requests
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
