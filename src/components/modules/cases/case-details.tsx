"use client";

import {
  ArrowLeft,
  ExternalLink,
  MessageSquareText,
  Pencil,
  Send,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import { PageHeading, StatusLabel } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import {
  useCaseMessages,
  useSendCaseMessage,
  useUpdateCase,
  useUpdateCaseStatus,
} from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { LegalCase, UserRole } from "@/services/justice.service";
import {
  CASE_STATUSES,
  type CasePriority,
  isCaseStatus,
} from "@/types/case.type";
import { CaseStatusActions } from "./case-status-actions";
import { CaseErrorMessage, CaseFact, caseInputClass } from "./case-ui";

const labelClass = "mb-1.5 block text-[11px] font-semibold text-[#506057]";

export function CaseDetails({
  caseData,
  role,
  active,
  isParticipant,
  children,
}: {
  caseData: LegalCase;
  role: UserRole;
  active: boolean;
  isParticipant: boolean;
  children: ReactNode;
}) {
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const messages = useCaseMessages(caseData.id, active);
  const sendMessageMutation = useSendCaseMessage(caseData.id);
  const updateCaseMutation = useUpdateCase(caseData.id);
  const updateStatusMutation = useUpdateCaseStatus(caseData.id);

  async function updateCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const filingDate = String(form.get("filingDate") ?? "");
    const priority = String(form.get("priority"));
    const status =
      role === "LAWYER" ? String(form.get("status")) : caseData.status;
    if (
      priority !== "LOW" &&
      priority !== "MEDIUM" &&
      priority !== "HIGH" &&
      priority !== "URGENT"
    ) {
      toast.error("Select a valid case priority.");
      return;
    }
    if (!isCaseStatus(status)) {
      toast.error("Select a valid case status.");
      return;
    }
    try {
      await updateCaseMutation.mutateAsync({
        title: String(form.get("title")).trim(),
        description: String(form.get("description") ?? "").trim(),
        caseType: String(form.get("caseType") ?? "").trim(),
        priority: priority as CasePriority,
        courtName: String(form.get("courtName") ?? "").trim(),
        courtCaseNumber: String(form.get("courtCaseNumber") ?? "").trim(),
        ...(filingDate && {
          filingDate: new Date(`${filingDate}T00:00:00.000Z`).toISOString(),
        }),
      });
      if (status !== caseData.status) {
        try {
          await updateStatusMutation.mutateAsync(status);
        } catch (error) {
          toast.error(
            `Case details were saved, but the status update failed: ${getApiErrorMessage(error)}`,
          );
          return;
        }
      }
      toast.success("Case updated");
      setEditing(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    try {
      await sendMessageMutation.mutateAsync(message.trim());
      setMessage("");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <>
      <Link
        href="../cases"
        className="mb-5 inline-flex items-center gap-1.5 text-xs text-[#6e7d73] hover:text-[#315744]"
      >
        <ArrowLeft size={14} /> All cases
      </Link>
      <PageHeading
        eyebrow={`Case ${caseData.caseNumber}`}
        title={caseData.title}
        description={
          caseData.description ?? "Case workspace and collaboration."
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusLabel>{caseData.status}</StatusLabel>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditing((value) => !value)}
            >
              <Pencil size={13} />
              {editing ? "Close edit" : "Update case"}
            </Button>
            <CaseStatusActions
              caseId={caseData.id}
              status={caseData.status}
              role={role}
            />
          </div>
        }
      />
      {editing && (
        <form
          onSubmit={updateCase}
          className="mb-5 grid gap-3 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-2"
        >
          <div>
            <label className={labelClass} htmlFor="edit-case-title">
              Case title *
            </label>
            <input
              required
              name="title"
              id="edit-case-title"
              defaultValue={caseData.title}
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-case-type">
              Case type
            </label>
            <input
              name="caseType"
              id="edit-case-type"
              defaultValue={caseData.caseType ?? ""}
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-case-priority">
              Priority
            </label>
            <select
              name="priority"
              id="edit-case-priority"
              defaultValue={caseData.priority}
              className={caseInputClass}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          {role === "LAWYER" && (
            <div>
              <label className={labelClass} htmlFor="edit-case-status">
                Case status
              </label>
              <select
                name="status"
                id="edit-case-status"
                defaultValue={caseData.status}
                className={caseInputClass}
              >
                {CASE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelClass} htmlFor="edit-case-court">
              Court name
            </label>
            <input
              name="courtName"
              id="edit-case-court"
              defaultValue={caseData.courtName ?? ""}
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-case-court-number">
              Court case number
            </label>
            <input
              name="courtCaseNumber"
              id="edit-case-court-number"
              defaultValue={caseData.courtCaseNumber ?? ""}
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-case-filing-date">
              Filing date
            </label>
            <input
              name="filingDate"
              id="edit-case-filing-date"
              type="date"
              defaultValue={caseData.filingDate?.slice(0, 10) ?? ""}
              className={caseInputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="edit-case-description">
              Description
            </label>
            <textarea
              name="description"
              id="edit-case-description"
              rows={3}
              defaultValue={caseData.description ?? ""}
              className={`${caseInputClass} h-auto py-2.5`}
            />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                updateCaseMutation.isPending || updateStatusMutation.isPending
              }
              className="bg-[#174638] text-white"
            >
              {updateCaseMutation.isPending || updateStatusMutation.isPending
                ? "Updating..."
                : "Save changes"}
            </Button>
          </div>
        </form>
      )}
      <div className="mb-6 grid gap-3 border-b border-[#e1e8e3] pb-5 sm:grid-cols-4">
        <CaseFact label="Priority" value={caseData.priority} />
        <CaseFact label="Case type" value={caseData.caseType ?? "—"} />
        <CaseFact
          label="Assigned lawyer"
          value={caseData.lawyer?.name ?? "—"}
        />
        <CaseFact label="Court" value={caseData.courtName ?? "—"} />
      </div>
      {children}

      {active && (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="border border-[#dfe6e2] bg-white">
            <div className="flex items-center gap-2 border-b border-[#e8ede9] px-4 py-3 text-xs font-semibold text-[#31483a]">
              <MessageSquareText size={15} /> Case messages
            </div>
            <div className="max-h-105 min-h-50 space-y-3 overflow-y-auto p-4">
              {messages.isPending ? (
                <p className="text-xs text-[#849088]">Loading messages...</p>
              ) : messages.isError ? (
                <CaseErrorMessage error={messages.error} />
              ) : (messages.data?.data ?? []).length === 0 ? (
                <p className="py-14 text-center text-xs text-[#87938c]">
                  No messages in this case yet.
                </p>
              ) : (
                (messages.data?.data ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="max-w-[85%] border border-[#e5ebe7] bg-[#f8faf8] px-3 py-2.5"
                  >
                    <div className="flex justify-between gap-4">
                      <span className="text-[11px] font-semibold text-[#365544]">
                        {item.sender?.name ?? "Case participant"}
                      </span>
                      <span className="text-[10px] text-[#8b9690]">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-[#4d5c52]">
                      {item.content}
                    </p>
                  </div>
                ))
              )}
            </div>
            {isParticipant && (
              <form
                onSubmit={sendMessage}
                className="flex gap-2 border-t border-[#e8ede9] p-3"
              >
                <label htmlFor="case-message" className="sr-only">
                  Write a case message
                </label>
                <input
                  id="case-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className={caseInputClass}
                  placeholder="Write a message"
                />
                <Button
                  type="submit"
                  aria-label="Send message"
                  disabled={sendMessageMutation.isPending || !message.trim()}
                  className="h-10 w-10 shrink-0 bg-[#174638] p-0 text-white"
                >
                  <Send size={15} />
                </Button>
              </form>
            )}
          </div>
          <div className="border border-[#dfe6e2] bg-white p-4">
            <h2 className="text-xs font-semibold text-[#31483a]">
              Case reference
            </h2>
            <div className="mt-3 space-y-3 text-xs">
              <CaseFact label="Client" value={caseData.client?.name ?? "—"} />
              <CaseFact label="Case number" value={caseData.caseNumber} />
              <CaseFact
                label="Opened"
                value={new Date(caseData.createdAt).toLocaleDateString()}
              />
              {caseData.appointment && (
                <Link
                  href={`/${role.toLowerCase()}/appointments/${caseData.appointment.id}`}
                  className="inline-flex items-center gap-1 text-[#39715d] hover:underline"
                >
                  Related appointment <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
