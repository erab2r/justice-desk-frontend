"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, isAfter, isBefore, parseISO } from "date-fns";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DataTable,
  PageHeading,
  StatusLabel,
} from "@/components/dashboard/data-table";
import { useCurrentUser } from "@/hooks/auth.hook";
import { useCases } from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { Appointment } from "@/services/justice.service";
import {
  type AppointmentStatus,
  justiceService,
  type UserRole,
} from "@/services/justice.service";

const overviewLinks: Record<
  UserRole,
  Array<{ label: string; href: string }>
> = {
  CLIENT: [
    { label: "Find counsel", href: "/client/lawyers" },
    { label: "View appointments", href: "/client/appointments" },
    { label: "Open a case", href: "/client/cases" },
  ],
  LAWYER: [
    { label: "Manage availability", href: "/lawyer/schedules" },
    { label: "Review appointments", href: "/lawyer/appointments" },
    { label: "Open case list", href: "/lawyer/cases" },
  ],
  ADMIN: [
    { label: "Review lawyer applications", href: "/admin/approve-lawyer" },
    { label: "Review cases", href: "/admin/cases" },
    { label: "View payments", href: "/admin/payments" },
  ],
  SUPER_ADMIN: [
    { label: "Review lawyer applications", href: "/admin/approve-lawyer" },
    { label: "Review cases", href: "/admin/cases" },
    { label: "View payments", href: "/admin/payments" },
  ],
};

const appointmentStatuses: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "ONGOING",
  "COMPLETED",
];

export default function OverviewPage({ userRole }: { userRole: UserRole }) {
  const { data: user } = useCurrentUser();
  const appointments = useQuery({
    queryKey: ["overview-appointments", userRole],
    queryFn: () =>
      justiceService.appointments(userRole, { page: 1, limit: 100 }),
  });
  const cases = useCases(userRole, { page: 1, limit: 8 }, [
    "overview-cases",
    userRole,
  ]);
  const payments = useQuery({
    queryKey: ["overview-payments", userRole],
    queryFn: () => justiceService.payments(userRole, { page: 1, limit: 100 }),
    enabled: userRole !== "LAWYER",
  });

  const appointmentRows = appointments.data?.data ?? [];
  const caseRows = cases.data?.data ?? [];
  const paymentRows = payments.data?.data ?? [];
  const today = new Date();
  const nextWeek = addDays(today, 7);
  const nextAppointments = appointmentRows.filter((appointment) => {
    const start = appointment.schedule?.startDateTime;
    if (
      !start ||
      appointment.status === "CANCELLED" ||
      appointment.status === "COMPLETED"
    )
      return false;
    const date = parseISO(start);
    return isAfter(date, today) && isBefore(date, nextWeek);
  });
  const paymentTotal = paymentRows
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const chartData = appointmentStatuses.map((status) => ({
    status: status.replaceAll("_", " "),
    total: appointmentRows.filter(
      (appointment) => appointment.status === status,
    ).length,
  }));
  const appointmentColumns = [
    {
      key: "date",
      label: "Date",
      render: (item: Appointment) =>
        item.schedule?.startDateTime
          ? new Date(item.schedule.startDateTime).toLocaleDateString()
          : "Not scheduled",
    },
    {
      key: "person",
      label: userRole === "CLIENT" ? "Lawyer" : "Client",
      render: (item: Appointment) =>
        userRole === "CLIENT"
          ? (item.lawyer?.name ?? "Counsel")
          : (item.client?.name ?? "Client"),
    },
    {
      key: "serial",
      label: "Serial",
      render: (item: Appointment) =>
        item.serialNumber ? `#${item.serialNumber}` : "Pending",
    },
    {
      key: "status",
      label: "Status",
      render: (item: Appointment) => <StatusLabel>{item.status}</StatusLabel>,
    },
  ];

  return (
    <div>
      <PageHeading
        eyebrow="Workspace"
        title={`Good day${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="A current view of your Justice Desk records and next steps."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<CalendarDays size={18} />}
          label="Appointments"
          value={
            appointments.isPending
              ? "—"
              : (appointments.data?.meta?.total ?? appointmentRows.length)
          }
          detail="Current service result"
        />
        <Metric
          icon={<Clock3 size={18} />}
          label="Next 7 days"
          value={appointments.isPending ? "—" : nextAppointments.length}
          detail="Scheduled appointments"
        />
        <Metric
          icon={<BriefcaseBusiness size={18} />}
          label="Cases"
          value={
            cases.isPending ? "—" : (cases.data?.meta?.total ?? caseRows.length)
          }
          detail="Current service result"
        />
        {userRole === "LAWYER" ? (
          <Metric
            icon={<CalendarDays size={18} />}
            label="Practice status"
            value={user?.lawyer?.verificationStatus ?? "—"}
            detail="Lawyer profile review"
          />
        ) : (
          <Metric
            icon={<CircleDollarSign size={18} />}
            label="Paid records"
            value={
              payments.isPending ? "—" : `BDT ${paymentTotal.toLocaleString()}`
            }
            detail="Paid entries in fetched page"
          />
        )}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)] sm:gap-5">
        <section className="rounded-xl border border-[#dfe6e2] bg-white p-4 shadow-[0_8px_28px_-24px_rgba(23,61,48,0.28)] sm:p-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#24382c]">
                Appointment status
              </h2>
              <p className="mt-1 text-xs text-[#7a867f]">
                Counts from the latest 100 records returned by the service.
              </p>
            </div>
            <Link
              href={`/${userRole.toLowerCase()}/appointments`}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#3f7057] hover:underline"
            >
              All appointments <ArrowRight size={13} />
            </Link>
          </div>
          {appointments.isError ? (
            <p
              role="alert"
              className="py-12 text-center text-sm text-[#985547]"
            >
              {getApiErrorMessage(appointments.error)}
            </p>
          ) : appointments.isPending ? (
            <div className="h-56 animate-pulse rounded-lg bg-[#f1f5f2]" />
          ) : appointmentRows.length === 0 ? (
            <p className="grid h-56 place-items-center text-sm text-[#87938c]">
              No appointment records returned.
            </p>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 12, right: 10, left: -16, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#e9efeb" />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 9, fill: "#7c8981" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#7c8981" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f5f8f5" }}
                    contentStyle={{
                      border: "1px solid #dfe6e2",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="total"
                    fill="#39715d"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[#dfe6e2] bg-white p-4 shadow-[0_8px_28px_-24px_rgba(23,61,48,0.28)] sm:p-5">
          <h2 className="text-sm font-semibold text-[#24382c]">Quick access</h2>
          <div className="mt-3 divide-y divide-[#edf1ee]">
            {overviewLinks[userRole].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-2 py-3 text-[13px] text-[#4c5c52] transition-colors hover:bg-[#f6f9f6] hover:text-[#174638]"
              >
                <span>{item.label}</span>
                <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#24382c]">
              Recent appointments
            </h2>
            <p className="mt-1 text-xs text-[#7a867f]">
              Latest appointment records returned for your role.
            </p>
          </div>
        </div>
        <DataTable
          columns={appointmentColumns}
          rows={appointmentRows.slice(0, 6)}
          isLoading={appointments.isPending}
          error={
            appointments.isError
              ? getApiErrorMessage(appointments.error)
              : undefined
          }
          emptyTitle="No appointments"
          emptyDescription="Appointments will be listed after a booking is initiated."
        />
      </section>
      {cases.isError && (
        <p className="mt-4 text-xs text-[#985547]">
          Cases could not be loaded: {getApiErrorMessage(cases.error)}
        </p>
      )}
      {payments.isError && (
        <p className="mt-2 text-xs text-[#985547]">
          Payments could not be loaded: {getApiErrorMessage(payments.error)}
        </p>
      )}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-[#dfe6e2] bg-white px-4 py-4 shadow-[0_8px_28px_-24px_rgba(23,61,48,0.28)] transition-shadow hover:shadow-[0_12px_32px_-24px_rgba(23,61,48,0.38)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#728078]">{label}</span>
        <span className="text-[#668270]">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-normal text-[#21372a]">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-[#8a958f]">{detail}</p>
    </div>
  );
}
