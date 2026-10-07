import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function LawyerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["LAWYER"]}>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
