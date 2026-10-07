"use client";

import { ExternalLink } from "lucide-react";
import { DataTable, PageHeading } from "@/components/dashboard/data-table";
import { useMyCaseReports } from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { CaseReport } from "@/types/case.type";

export function ReportsPage() {
  const reports = useMyCaseReports({ page: 1, limit: 50 });
  const rows = reports.data?.data ?? [];
  const columns = [
    {
      key: "title",
      label: "Report",
      render: (row: CaseReport) => row.title,
    },
    {
      key: "summary",
      label: "Summary",
      render: (row: CaseReport) => row.summary ?? "—",
    },
    {
      key: "case",
      label: "Case",
      render: (row: CaseReport) => {
        const caseInfo = row.case;
        return caseInfo?.caseNumber ?? "—";
      },
    },
    {
      key: "report",
      label: "File",
      render: (row: CaseReport) =>
        row.reportUrl ? (
          <a
            href={row.reportUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#39715d] hover:underline"
          >
            Open report <ExternalLink size={13} />
          </a>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div>
      <PageHeading
        eyebrow="Case reporting"
        title="Reports"
        description="Reports created by your account through the case-report service."
      />
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={reports.isPending}
        error={reports.isError ? getApiErrorMessage(reports.error) : undefined}
        emptyTitle="No reports found"
        emptyDescription="Case reports appear after a lawyer creates one for a case."
      />
    </div>
  );
}
