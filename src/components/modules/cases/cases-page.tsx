"use client";

import { FilePlus2, Pencil } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  DataTable,
  PageHeading,
  StatusLabel,
} from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { useGetMyAppointments } from "@/hooks/appointment.hook";
import { useCurrentUser } from "@/hooks/auth.hook";
import {
  useCases,
  useCloseCase,
  useCreateCase,
  useUpdateCase,
  useUpdateCaseStatus,
} from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import { isCaseStatus, type LegalCase } from "@/types/case.type";
import { allowedTransitions } from "./case-status-actions";

const controlClass =
  "h-10 w-full rounded-md border border-[#d9e2dc] bg-white px-3 text-sm text-[#26382d] outline-none focus:border-[#56826c] focus:ring-2 focus:ring-[#56826c]/15";
const fieldLabel = "mb-1.5 block text-[11px] font-semibold text-[#506057]";

export function CasesPage() {
  const { data: user } = useCurrentUser();
  const role = user?.role ?? "CLIENT";
  const cases = useCases(role, { page: 1, limit: 50 });
  const appointments = useGetMyAppointments(
    { page: 1, limit: 100 },
    role === "CLIENT",
  );
  const createCaseMutation = useCreateCase();
  const [showCreate, setShowCreate] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [statusCase, setStatusCase] = useState<LegalCase | null>(null);
  const [statusDraft, setStatusDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [priority, setPriority] = useState<LegalCase["priority"]>("MEDIUM");
  const updateCaseMutation = useUpdateCase(editingCase?.id ?? "");
  const tableStatusMutation = useUpdateCaseStatus(statusCase?.id ?? "");
  const tableCloseCaseMutation = useCloseCase(statusCase?.id ?? "");
  const eligibleAppointments = (appointments.data?.data ?? []).filter(
    (item) => item.status === "COMPLETED" && !item.case,
  );
  const selectedAppointment = eligibleAppointments.find(
    (item) => item.id === appointmentId,
  );
  const selectedLawyerId =
    selectedAppointment?.lawyerId ?? selectedAppointment?.lawyer?.id;

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!selectedAppointment || selectedAppointment.status !== "COMPLETED") {
      setError("Only completed appointments can be used to create a case.");
      return;
    }
    if (!selectedLawyerId) {
      setError("The completed appointment has no associated lawyer.");
      return;
    }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await createCaseMutation.mutateAsync({
        title: String(form.get("title")),
        lawyerId: selectedLawyerId,
        appointmentId: selectedAppointment.id,
        priority,
        ...(String(form.get("description") ?? "").trim() && {
          description: String(form.get("description")).trim(),
        }),
        ...(String(form.get("caseType") ?? "").trim() && {
          caseType: String(form.get("caseType")).trim(),
        }),
        ...(String(form.get("courtName") ?? "").trim() && {
          courtName: String(form.get("courtName")).trim(),
        }),
        ...(String(form.get("courtCaseNumber") ?? "").trim() && {
          courtCaseNumber: String(form.get("courtCaseNumber")).trim(),
        }),
        ...(String(form.get("filingDate") ?? "").trim() && {
          filingDate: new Date(
            `${String(form.get("filingDate"))}T00:00:00.000Z`,
          ).toISOString(),
        }),
      });
      toast.success("Case created");
      setShowCreate(false);
      setAppointmentId("");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingCase) return;
    setBusy(true);
    setUpdateError("");
    const form = new FormData(event.currentTarget);
    const filingDate = String(form.get("filingDate") ?? "");
    const nextPriority = String(form.get("priority"));
    if (
      nextPriority !== "LOW" &&
      nextPriority !== "MEDIUM" &&
      nextPriority !== "HIGH" &&
      nextPriority !== "URGENT"
    ) {
      setUpdateError("Select a valid case priority.");
      setBusy(false);
      return;
    }
    try {
      await updateCaseMutation.mutateAsync({
        title: String(form.get("title")).trim(),
        description: String(form.get("description") ?? "").trim(),
        caseType: String(form.get("caseType") ?? "").trim(),
        priority: nextPriority,
        courtName: String(form.get("courtName") ?? "").trim(),
        courtCaseNumber: String(form.get("courtCaseNumber") ?? "").trim(),
        ...(filingDate && {
          filingDate: new Date(`${filingDate}T00:00:00.000Z`).toISOString(),
        }),
      });
      toast.success("Case updated");
      setEditingCase(null);
    } catch (caught) {
      setUpdateError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!statusCase || role !== "LAWYER") return;
    if (!isCaseStatus(statusDraft)) {
      setStatusError("Select a valid case status.");
      return;
    }
    if (!allowedTransitions[statusCase.status].includes(statusDraft)) {
      setStatusError("That status change is not allowed.");
      return;
    }

    setStatusError("");
    try {
      if (statusDraft === "CLOSED") {
        await tableCloseCaseMutation.mutateAsync();
      } else {
        await tableStatusMutation.mutateAsync(statusDraft);
      }
      toast.success(`Case moved to ${statusDraft.replaceAll("_", " ")}.`);
      setStatusCase(null);
    } catch (caught) {
      setStatusError(getApiErrorMessage(caught));
    }
  }

  const rows = cases.data?.data ?? [];
  const columns = [
    {
      key: "number",
      label: "Case",
      render: (item: LegalCase) => (
        <Link
          href={`/${role.toLowerCase()}/cases/${item.id}`}
          className="font-semibold text-[#315744] hover:underline"
        >
          {item.caseNumber}
        </Link>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (item: LegalCase) => (
        <Link
          href={`/${role.toLowerCase()}/cases/${item.id}`}
          className="hover:text-[#315744]"
        >
          {item.title}
        </Link>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item: LegalCase) => item.caseType || "—",
    },
    {
      key: "priority",
      label: "Priority",
      render: (item: LegalCase) => item.priority,
    },
    {
      key: "status",
      label: "Status",
      render: (item: LegalCase) => <StatusLabel>{item.status}</StatusLabel>,
    },
    {
      key: "owner",
      label: role === "CLIENT" ? "Lawyer" : "Client",
      render: (item: LegalCase) =>
        role === "CLIENT"
          ? (item.lawyer?.name ?? "Unassigned")
          : (item.client?.name ?? "Client"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: LegalCase) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setUpdateError("");
              setEditingCase(item);
              setStatusCase(null);
            }}
          >
            <Pencil size={13} /> Update
          </Button>
          {role === "LAWYER" && allowedTransitions[item.status].length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const nextStatuses = allowedTransitions[item.status];
                setStatusError("");
                setStatusCase(item);
                setStatusDraft(nextStatuses[0]);
                setEditingCase(null);
              }}
            >
              Update status
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeading
        eyebrow="Matter management"
        title="Cases"
        description="Cases and workflow status from your authorized case list."
        action={
          role === "CLIENT" && eligibleAppointments.length > 0 ? (
            <Button
              type="button"
              onClick={() => setShowCreate((value) => !value)}
              className="h-9 gap-2 bg-[#174638] text-white"
            >
              <FilePlus2 size={15} /> Create case
            </Button>
          ) : undefined
        }
      />
      {showCreate && eligibleAppointments.length > 0 && (
        <form
          onSubmit={create}
          className="mb-5 grid gap-3 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-2"
        >
          <div>
            <label className={fieldLabel} htmlFor="new-case-title">
              Case title *
            </label>
            <input
              required
              name="title"
              id="new-case-title"
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="new-case-type">
              Case type
            </label>
            <input
              name="caseType"
              id="new-case-type"
              placeholder="e.g. PROPERTY"
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="new-case-appointment">
              Completed appointment *
            </label>
            <select
              required
              id="new-case-appointment"
              value={appointmentId}
              onChange={(event) => setAppointmentId(event.target.value)}
              className={controlClass}
            >
              <option value="">Select completed appointment</option>
              {eligibleAppointments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.lawyer?.name ?? "Assigned lawyer"} ·{" "}
                  {item.schedule?.startDateTime
                    ? new Date(item.schedule.startDateTime).toLocaleDateString()
                    : item.id.slice(0, 8)}
                </option>
              ))}
            </select>
            {!selectedAppointment && (
              <p className="mt-1 text-[11px] text-[#78857d]">
                Select a completed appointment to enable case creation.
              </p>
            )}
          </div>
          {selectedAppointment && (
            <div>
              <span className={fieldLabel}>Associated lawyer</span>
              <p className="flex h-10 items-center rounded-md border border-[#d9e2dc] bg-[#f7f9f7] px-3 text-sm text-[#405247]">
                {selectedAppointment.lawyer?.name ?? "Assigned lawyer"}
              </p>
            </div>
          )}
          <div>
            <label className={fieldLabel} htmlFor="new-case-priority">
              Priority
            </label>
            <select
              id="new-case-priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as typeof priority)
              }
              className={controlClass}
            >
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
              <option>URGENT</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="new-case-court">
              Court name
            </label>
            <input
              name="courtName"
              id="new-case-court"
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="new-case-court-number">
              Court case number
            </label>
            <input
              name="courtCaseNumber"
              id="new-case-court-number"
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="new-case-filing-date">
              Filing date
            </label>
            <input
              name="filingDate"
              id="new-case-filing-date"
              type="date"
              className={controlClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={fieldLabel} htmlFor="new-case-desc">
              Description
            </label>
            <textarea
              name="description"
              id="new-case-desc"
              rows={3}
              className={`${controlClass} h-auto py-2.5`}
            />
          </div>
          {error && (
            <p className="text-xs text-[#985547] sm:col-span-2">{error}</p>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreate(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={busy || !selectedAppointment || !selectedLawyerId}
              className="bg-[#174638] text-white"
            >
              {busy ? "Creating..." : "Create case"}
            </Button>
          </div>
        </form>
      )}
      {editingCase && (
        <form
          onSubmit={update}
          className="mb-5 grid gap-3 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <h2 className="text-sm font-semibold text-[#2d4838]">
              Update case · {editingCase.caseNumber}
            </h2>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="table-edit-case-title">
              Case title *
            </label>
            <input
              required
              name="title"
              id="table-edit-case-title"
              defaultValue={editingCase.title}
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="table-edit-case-type">
              Case type
            </label>
            <input
              name="caseType"
              id="table-edit-case-type"
              defaultValue={editingCase.caseType ?? ""}
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="table-edit-case-priority">
              Priority
            </label>
            <select
              name="priority"
              id="table-edit-case-priority"
              defaultValue={editingCase.priority}
              className={controlClass}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="table-edit-case-court">
              Court name
            </label>
            <input
              name="courtName"
              id="table-edit-case-court"
              defaultValue={editingCase.courtName ?? ""}
              className={controlClass}
            />
          </div>
          <div>
            <label
              className={fieldLabel}
              htmlFor="table-edit-case-court-number"
            >
              Court case number
            </label>
            <input
              name="courtCaseNumber"
              id="table-edit-case-court-number"
              defaultValue={editingCase.courtCaseNumber ?? ""}
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="table-edit-case-filing-date">
              Filing date
            </label>
            <input
              name="filingDate"
              id="table-edit-case-filing-date"
              type="date"
              defaultValue={editingCase.filingDate?.slice(0, 10) ?? ""}
              className={controlClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={fieldLabel} htmlFor="table-edit-case-description">
              Description
            </label>
            <textarea
              name="description"
              id="table-edit-case-description"
              rows={3}
              defaultValue={editingCase.description ?? ""}
              className={`${controlClass} h-auto py-2.5`}
            />
          </div>
          {updateError && (
            <p role="alert" className="text-xs text-[#985547] sm:col-span-2">
              {updateError}
            </p>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingCase(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy || updateCaseMutation.isPending}
              className="bg-[#174638] text-white"
            >
              {busy || updateCaseMutation.isPending
                ? "Updating..."
                : "Save changes"}
            </Button>
          </div>
        </form>
      )}
      {statusCase && role === "LAWYER" && (
        <form
          onSubmit={updateStatus}
          className="mb-5 grid gap-3 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-[1fr_auto]"
        >
          <div>
            <label className={fieldLabel} htmlFor="table-case-status">
              Update status for {statusCase.caseNumber}
            </label>
            <select
              id="table-case-status"
              value={statusDraft}
              onChange={(event) => setStatusDraft(event.target.value)}
              className={controlClass}
            >
              {allowedTransitions[statusCase.status].map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusCase(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                tableStatusMutation.isPending ||
                tableCloseCaseMutation.isPending
              }
              className="bg-[#174638] text-white"
            >
              {tableStatusMutation.isPending || tableCloseCaseMutation.isPending
                ? "Updating..."
                : "Save status"}
            </Button>
          </div>
          {statusError && (
            <p role="alert" className="text-xs text-[#985547] sm:col-span-2">
              {statusError}
            </p>
          )}
        </form>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={cases.isPending}
        error={cases.isError ? getApiErrorMessage(cases.error) : undefined}
        emptyTitle="No cases found"
        emptyDescription={
          role === "CLIENT"
            ? "Cases created from your completed consultations will appear here."
            : "No case records were returned for your account."
        }
      />
    </div>
  );
}
