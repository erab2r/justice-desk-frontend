"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCloseCase, useUpdateCaseStatus } from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { CaseStatus } from "@/types/case.type";
import type { UserRole } from "@/types/user.type";

export const allowedTransitions: Record<CaseStatus, CaseStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["WAITING_FOR_CLIENT"],
  WAITING_FOR_CLIENT: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

export function CaseStatusActions({
  caseId,
  status,
  role,
}: {
  caseId: string;
  status: CaseStatus;
  role: UserRole;
}) {
  const updateStatus = useUpdateCaseStatus(caseId);
  const closeCase = useCloseCase(caseId);
  const nextStatuses = role === "LAWYER" ? allowedTransitions[status] : [];
  const isPending = updateStatus.isPending || closeCase.isPending;

  async function transition(nextStatus: CaseStatus) {
    try {
      if (nextStatus === "CLOSED") {
        await closeCase.mutateAsync();
      } else {
        await updateStatus.mutateAsync(nextStatus);
      }
      toast.success(`Case moved to ${nextStatus.replaceAll("_", " ")}.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (!nextStatuses.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((nextStatus) => (
        <Button
          key={nextStatus}
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => void transition(nextStatus)}
        >
          {isPending
            ? "Updating..."
            : `Move to ${nextStatus.replaceAll("_", " ")}`}
        </Button>
      ))}
    </div>
  );
}
