"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCaseActivities, useCreateCaseActivity } from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  CaseEmptySection,
  CaseErrorMessage,
  caseInputClass,
  caseLabelClass,
} from "./case-ui";

export function CaseActivity({
  caseId,
  active,
  canLog,
}: {
  caseId: string;
  active: boolean;
  canLog: boolean;
}) {
  const activities = useCaseActivities(caseId, active);
  const createActivity = useCreateCaseActivity(caseId);
  const [action, setAction] = useState("CASE_UPDATED");
  const [message, setMessage] = useState("");

  async function logActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createActivity.mutateAsync({
        action,
        ...(message.trim() && { message: message.trim() }),
      });
      setMessage("");
      toast.success("Timeline entry added");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (!active) return null;

  return (
    <section className="space-y-4">
      {canLog && (
        <form
          onSubmit={logActivity}
          className="grid gap-2 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-[180px_1fr_auto]"
        >
          <div>
            <label className={caseLabelClass} htmlFor="activity-action">
              Action
            </label>
            <input
              id="activity-action"
              value={action}
              onChange={(event) => setAction(event.target.value)}
              required
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="activity-message">
              Update note
            </label>
            <input
              id="activity-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className={caseInputClass}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={createActivity.isPending}
              className="bg-[#174638] text-white"
            >
              Log activity
            </Button>
          </div>
        </form>
      )}
      {activities.isPending ? (
        <p className="text-sm text-[#829087]">Loading case activity...</p>
      ) : activities.isError ? (
        <CaseErrorMessage error={activities.error} />
      ) : (activities.data?.data ?? []).length === 0 ? (
        <CaseEmptySection text="No activity entries returned." />
      ) : (
        <ol className="border-l border-[#d4e0d7] pl-5">
          {(activities.data?.data ?? []).map((item) => (
            <li key={item.id} className="relative pb-5 last:pb-0">
              <span className="absolute -left-6.25 top-1.5 size-2 rounded-full border-2 border-[#4d8064] bg-[#f6faf7]" />
              <p className="text-xs font-semibold text-[#385342]">
                {item.action.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#65736a]">
                {item.message ?? "Status or case activity recorded."}
              </p>
              <p className="mt-1 text-[10px] text-[#8a958e]">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
