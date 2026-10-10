"use client";

import { ArrowLeft, Video } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PageHeading } from "@/components/dashboard/data-table";
import { useCurrentUser } from "@/hooks/auth.hook";
import { useCase } from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import { CaseActivity } from "./case-activity";
import { CaseNotes } from "./case-billing";
import { CaseDetails } from "./case-details";
import { CaseDocuments } from "./case-documents";
import { CaseReports } from "./case-reports";

type CaseTab =
  | "messages"
  | "timeline"
  | "documents"
  | "reports"
  | "notes"
  | "video";

export function CaseWorkspacePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: user } = useCurrentUser();
  const caseQuery = useCase(caseId);
  const [tab, setTab] = useState<CaseTab>("messages");
  const caseData = caseQuery.data?.data;
  const role = user?.role ?? "CLIENT";
  const lawyerOrAdmin =
    role === "LAWYER" || role === "ADMIN" || role === "SUPER_ADMIN";
  const isParticipant = role === "CLIENT" || role === "LAWYER";

  if (caseQuery.isPending) {
    return <div className="h-72 animate-pulse bg-white" />;
  }

  if (caseQuery.isError || !caseData) {
    return (
      <div>
        <PageHeading title="Case unavailable" />
        <p role="alert" className="text-sm text-[#985547]">
          {caseQuery.error
            ? getApiErrorMessage(caseQuery.error)
            : "Case not found"}
        </p>
        <Link
          href="../cases"
          className="mt-4 inline-flex items-center gap-2 text-sm text-[#39715d]"
        >
          <ArrowLeft size={15} /> Back to cases
        </Link>
      </div>
    );
  }

  const tabs: Array<{ id: CaseTab; label: string }> = [
    { id: "messages", label: "Messages" },
    { id: "timeline", label: "Activity" },
    { id: "documents", label: "Documents" },
    { id: "reports", label: "Reports" },
    ...(lawyerOrAdmin
      ? [{ id: "notes" as const, label: "Private notes" }]
      : role === "CLIENT"
        ? [{ id: "notes" as const, label: "Lawyer notes" }]
        : []),
    ...(isParticipant
      ? [{ id: "video" as const, label: "Video session" }]
      : []),
  ];

  return (
    <div>
      <CaseDetails
        caseData={caseData}
        role={role}
        active={tab === "messages"}
        isParticipant={isParticipant}
      >
        <div className="mb-4 flex gap-1 overflow-x-auto border-b border-[#dfe6e2]">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 border-b-2 px-3 py-2.5 text-xs ${tab === item.id ? "border-[#39715d] font-semibold text-[#24523c]" : "border-transparent text-[#78857d] hover:text-[#3d5547]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </CaseDetails>
      <CaseActivity
        caseId={caseId}
        active={tab === "timeline"}
        canLog={lawyerOrAdmin}
      />
      <CaseDocuments caseId={caseId} active={tab === "documents"} />
      <CaseReports
        caseId={caseId}
        active={tab === "reports"}
        canCreate={role === "LAWYER"}
      />
      <CaseNotes caseId={caseId} role={role} active={tab === "notes"} />
      {tab === "video" && (
        <section className="max-w-2xl border border-dashed border-[#d5dfd8] bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#31483a]">
            <Video size={16} /> Video sessions
          </div>
          <p className="mt-3 text-xs leading-5 text-[#748178]">
            Video-session endpoints are listed in the backend repository, but
            the router is not mounted in the deployed application yet. This
            module is unavailable until the backend exposes it.
          </p>
        </section>
      )}
    </div>
  );
}
