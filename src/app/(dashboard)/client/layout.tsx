import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={["CLIENT"]}>
      <DashboardShell>{children}</DashboardShell>
    </RoleGuard>
  );
}
