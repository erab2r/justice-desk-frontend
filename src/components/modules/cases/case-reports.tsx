"use client";

import { Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCaseReports, useCreateCaseReport } from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import { CaseObjectList, caseInputClass, caseLabelClass } from "./case-ui";

export function CaseReports({
  caseId,
  active,
  canCreate,
}: {
  caseId: string;
  active: boolean;
  canCreate: boolean;
}) {
  const reports = useCaseReports(caseId, active);
  const createReport = useCreateCaseReport(caseId);
  const [open, setOpen] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createReport.mutateAsync({
        title: String(form.get("title")),
        summary: String(form.get("summary")),
      });
      toast.success("Case report created");
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (!active) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-[#7b8880]">
          Case reports returned by the case-report endpoint.
        </p>
        {canCreate && (
          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(!open)}
            className="gap-1.5 bg-[#174638] text-white"
          >
            <Plus size={14} /> New report
          </Button>
        )}
      </div>
      {open && (
        <form
          onSubmit={submit}
          className="mb-4 grid gap-3 border border-[#dfe6e2] bg-white p-4"
        >
          <div>
            <label className={caseLabelClass} htmlFor="report-title">
              Report title
            </label>
            <input
              required
              name="title"
              id="report-title"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="report-summary">
              Summary
            </label>
            <textarea
              required
              name="summary"
              id="report-summary"
              rows={4}
              className={`${caseInputClass} h-auto py-2.5`}
            />
          </div>
          <Button
            type="submit"
            disabled={createReport.isPending}
            className="justify-self-end bg-[#174638] text-white"
          >
            Create report
          </Button>
        </form>
      )}
      <CaseObjectList
        rows={reports.data?.data ?? []}
        isLoading={reports.isPending}
        error={reports.error}
        empty="No reports have been created for this case."
      />
    </section>
  );
}
