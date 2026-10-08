"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { PageHeading, StatusLabel } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { useUpdateLawyerProfile } from "@/hooks/lawyer.hook";
import { useCurrentUser } from "@/hooks/auth.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import { justiceService } from "@/services/justice.service";

const inputClass =
  "h-10 w-full rounded-lg border border-[#d9e2dc] bg-white px-3 text-sm text-[#26382d] shadow-sm outline-none transition focus:border-[#56826c] focus:ring-2 focus:ring-[#56826c]/15 disabled:bg-[#f5f7f5]";
const labelClass = "mb-1.5 block text-[11px] font-semibold text-[#506057]";

function ErrorMessage({ error }: { error: unknown }) {
  return (
    <p role="alert" className="text-sm text-[#985547]">
      {getApiErrorMessage(error)}
    </p>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.08em] text-[#87938c]">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-[#405247]">{value}</p>
    </div>
  );
}

export function AppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { data: user } = useCurrentUser();
  const appointment = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => justiceService.appointment(appointmentId),
  });
  if (appointment.isPending)
    return <div className="h-64 animate-pulse bg-white" />;
  if (appointment.isError)
    return (
      <div>
        <PageHeading title="Appointment unavailable" />
        <ErrorMessage error={appointment.error} />
      </div>
    );
  const item = appointment.data.data;
  return (
    <div>
      <Link
        href="../appointments"
        className="mb-5 inline-flex items-center gap-1.5 rounded-md text-xs text-[#6e7d73] transition-colors hover:text-[#315744] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#56826c]/40"
      >
        <ArrowLeft size={14} /> Appointments
      </Link>
      <PageHeading
        eyebrow="Appointment"
        title={item.lawyer?.name ?? "Consultation"}
        description={
          item.schedule
            ? `${new Date(item.schedule.startDateTime).toLocaleString()} – ${new Date(item.schedule.endDateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Appointment schedule details"
        }
        action={<StatusLabel>{item.status}</StatusLabel>}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-[#dfe6e2] bg-white p-4 shadow-[0_8px_28px_-24px_rgba(23,61,48,0.28)] sm:p-5">
          <Fact label="Appointment ID" value={item.id} />
          <Fact
            label="Serial number"
            value={
              item.serialNumber
                ? `#${item.serialNumber}`
                : "Assigned after payment"
            }
          />
          <Fact
            label="Meeting link"
            value={
              item.meetingLink ?? item.schedule?.meetingLink ?? "Not provided"
            }
          />
          <Fact
            label="Payment"
            value={
              item.payment
                ? `${item.payment.paymentGateway} · ${item.payment.status}`
                : "Not initiated"
            }
          />
        </div>
        <div className="space-y-4 rounded-xl border border-[#dfe6e2] bg-white p-4 shadow-[0_8px_28px_-24px_rgba(23,61,48,0.28)] sm:p-5">
          <Fact label="Client" value={item.client?.name ?? "—"} />
          <Fact label="Lawyer" value={item.lawyer?.name ?? "—"} />
          <Fact
            label="Start"
            value={
              item.schedule
                ? new Date(item.schedule.startDateTime).toLocaleString()
                : "—"
            }
          />
          <Fact
            label="End"
            value={
              item.schedule
                ? new Date(item.schedule.endDateTime).toLocaleString()
                : "—"
            }
          />
        </div>
      </div>
      {user?.role === "CLIENT" && item.status === "CONFIRMED" && (
        <p className="mt-4 text-xs text-[#748178]">
          The join action is only available between the schedule start and end
          time.
        </p>
      )}
    </div>
  );
}

export function LawyerProfilePage() {
  const { data: user } = useCurrentUser();
  const profile = user?.lawyer;
  const profileMutation = useUpdateLawyerProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await profileMutation.mutateAsync({
        bio: String(form.get("bio") ?? ""),
        qualifications: String(form.get("qualifications") ?? ""),
        address: String(form.get("address") ?? ""),
        contactNumber: String(form.get("contactNumber") ?? ""),
        ...(String(form.get("consultationFee") ?? "").trim() && {
          consultationFee: Number(form.get("consultationFee")),
        }),
        experienceYears: Number(form.get("experienceYears")),
      });
      toast.success("Lawyer profile updated");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeading
        eyebrow="Lawyer account"
        title="Professional profile"
        description="Update the fields supported by the lawyer profile endpoint."
        action={
          profile && <StatusLabel>{profile.verificationStatus}</StatusLabel>
        }
      />
      {!profile ? (
        <div className="border border-[#ead8d3] bg-[#fffaf8] p-4 text-sm text-[#895346]">
          No lawyer profile was returned for this account.
        </div>
      ) : (
        <form
          onSubmit={save}
          className="grid max-w-3xl gap-4 rounded-xl border border-[#dfe6e2] bg-white p-4 shadow-[0_8px_28px_-24px_rgba(23,61,48,0.28)] sm:grid-cols-2 sm:p-6"
        >
          <div>
            <label className={labelClass} htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              disabled
              value={user?.name ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="profile-email">
              Email
            </label>
            <input
              id="profile-email"
              disabled
              value={user?.email ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="profile-license">
              License number
            </label>
            <input
              id="profile-license"
              disabled
              value={profile.licenseNumber ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="profile-phone">
              Contact number
            </label>
            <input
              name="contactNumber"
              id="profile-phone"
              defaultValue={profile.contactNumber ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="profile-qualifications">
              Qualifications
            </label>
            <input
              name="qualifications"
              id="profile-qualifications"
              defaultValue={profile.qualifications ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="profile-years">
              Years of experience
            </label>
            <input
              name="experienceYears"
              id="profile-years"
              type="number"
              min="0.01"
              step="1"
              defaultValue={profile.experienceYears ?? 0}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="profile-fee">
              Consultation fee (BDT)
            </label>
            <input
              name="consultationFee"
              id="profile-fee"
              type="number"
              min="0"
              step="any"
              defaultValue={profile.consultationFee ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="profile-address">
              Address
            </label>
            <input
              name="address"
              id="profile-address"
              defaultValue={profile.address ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="profile-bio">
              Professional bio
            </label>
            <textarea
              name="bio"
              id="profile-bio"
              rows={4}
              defaultValue={profile.bio ?? ""}
              className={`${inputClass} h-auto py-2.5`}
            />
          </div>
          {error && (
            <p className="text-xs text-[#985547] sm:col-span-2">{error}</p>
          )}
          <div className="sm:col-span-2">
            <Button disabled={busy} className="bg-[#174638] text-white">
              {busy ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
