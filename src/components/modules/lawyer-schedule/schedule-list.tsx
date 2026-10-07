"use client";

import { Suspense, useState } from "react";
import { PageHeading } from "@/components/dashboard/data-table";
import { useCurrentUser } from "@/hooks/auth.hook";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ScheduleParams, ScheduleStatus } from "@/types";
import ScheduleCreateDialog from "./schedule-create-dialog";
import ScheduleListLoading from "./schedule-list-loading";
import ScheduleTable from "./schedule-table";

const statuses: ["ALL" | ScheduleStatus, string][] = [
  ["ALL", "All"],
  ["DRAFT", "Draft"],
  ["PUBLISHED", "Published"],
];

export default function ScheduleList() {
  const [tab, setTab] = useState<"ALL" | ScheduleStatus>("ALL");
  const { data: user } = useCurrentUser();
  const canManageSchedules =
    user?.lawyer?.verificationStatus === "APPROVED";

  const queryParams: ScheduleParams = {
    page: 1,
    limit: 10,
    sortBy: "startDateTime",
    sortOrder: "asc",
    ...(tab === "ALL" ? {} : { status: tab }),
  };

  return (
    <>
      <PageHeading
        eyebrow="Availability"
        title="Schedules"
        description="Create a date-and-time window with appointment capacity, then publish it for booking."
      />
      <div className="my-5 flex justify-between gap-3">
        <Tabs value={tab} onValueChange={(value) => setTab(value)}>
          <TabsList>
            {statuses.map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {canManageSchedules && <ScheduleCreateDialog />}
      </div>
      {!canManageSchedules && (
        <p className="mb-4 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Schedule creation and publishing are available after your Lawyer
          application is approved.
        </p>
      )}

      <Suspense fallback={<ScheduleListLoading />}>
        <ScheduleTable
          {...queryParams}
          canManageSchedules={canManageSchedules}
        />
      </Suspense>
    </>
  );
}
