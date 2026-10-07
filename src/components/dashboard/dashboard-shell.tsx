"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  FileText,
  Gavel,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Scale,
  UsersRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";
import AuthLoading from "@/components/auth/auth-loading";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks/auth.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import { justiceService } from "@/services/justice.service";
import type { UserRole } from "@/types/user.type";

const navByRole: Record<
  UserRole,
  Array<{ label: string; href: string; icon: typeof LayoutDashboard }>
> = {
  CLIENT: [
    { label: "Overview", href: "/client", icon: LayoutDashboard },
    { label: "Find counsel", href: "/client/lawyers", icon: UsersRound },
    { label: "Appointments", href: "/client/appointments", icon: CalendarDays },
    { label: "My cases", href: "/client/cases", icon: BriefcaseBusiness },
    { label: "Documents", href: "/client/documents", icon: FileText },
    { label: "Payments", href: "/client/payments", icon: Wallet },
    { label: "Invoices", href: "/client/invoices", icon: ReceiptText },
  ],
  LAWYER: [
    { label: "Overview", href: "/lawyer", icon: LayoutDashboard },
    { label: "Appointments", href: "/lawyer/appointments", icon: CalendarDays },
    { label: "Availability", href: "/lawyer/schedules", icon: CalendarDays },
    { label: "Cases", href: "/lawyer/cases", icon: BriefcaseBusiness },
    { label: "Documents", href: "/lawyer/documents", icon: FileText },
    { label: "Invoices", href: "/lawyer/invoices", icon: ReceiptText },
    { label: "Reports", href: "/lawyer/reports", icon: Gavel },
    { label: "Profile", href: "/lawyer/profile", icon: Scale },
  ],
  ADMIN: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Lawyer review", href: "/admin/approve-lawyer", icon: UsersRound },
    { label: "Cases", href: "/admin/cases", icon: BriefcaseBusiness },
    { label: "Appointments", href: "/admin/appointments", icon: CalendarDays },
    { label: "Payments", href: "/admin/payments", icon: Wallet },
    { label: "Specializations", href: "/admin/specializations", icon: Scale },
    { label: "Invoices", href: "/admin/invoices", icon: ReceiptText },
  ],
  SUPER_ADMIN: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Lawyer review", href: "/admin/approve-lawyer", icon: UsersRound },
    { label: "Cases", href: "/admin/cases", icon: BriefcaseBusiness },
    { label: "Appointments", href: "/admin/appointments", icon: CalendarDays },
    { label: "Payments", href: "/admin/payments", icon: Wallet },
    { label: "Specializations", href: "/admin/specializations", icon: Scale },
    { label: "Invoices", href: "/admin/invoices", icon: ReceiptText },
  ],
};

const roleTitle: Record<UserRole, string> = {
  CLIENT: "Client workspace",
  LAWYER: "Counsel workspace",
  ADMIN: "Administration",
  SUPER_ADMIN: "Super administration",
};

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const userRole = user?.role;
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const imageInput = useRef<HTMLInputElement>(null);
  const imageMutation = useMutation({
    mutationFn: justiceService.updateProfileImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  });
  if (!userRole) {
    return <AuthLoading />;
  }

  const navigation = navByRole[userRole];

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => router.replace("/login"),
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#19211e]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-62 flex-col border-r border-[#dfe6e2] bg-[#fbfcfb] lg:flex">
        <Link
          href="/"
          className="flex h-19 items-center gap-3 border-b border-[#e5ebe7] px-6"
        >
          <span className="grid size-9 place-items-center rounded-md bg-[#123d32] text-white">
            <Scale size={19} />
          </span>
          <span className="font-semibold tracking-[0.01em]">Justice Desk</span>
        </Link>
        <div className="px-5 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#7b8982]">
          {roleTitle[userRole]}
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== `/${userRole.toLowerCase()}` &&
                pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-[13px] transition-colors ${active ? "bg-[#e7efeb] font-semibold text-[#174638]" : "text-[#56635d] hover:bg-[#f0f4f1] hover:text-[#1d3c32]"}`}
              >
                <Icon size={17} strokeWidth={1.8} />
                {label}
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-[#35745e]" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[#e5ebe7] p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#dce9e2] text-sm font-semibold text-[#285441]">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                (user?.name?.slice(0, 1).toUpperCase() ?? "J")
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">
                {user?.name}
              </span>
              <span className="block truncate text-[11px] text-[#78847e]">
                {user?.email}
              </span>
            </span>
          </div>
          <input
            ref={imageInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              imageMutation.mutate(file, {
                onSuccess: () => toast.success("Profile image updated"),
                onError: (error) => toast.error(getApiErrorMessage(error)),
                onSettled: () => {
                  event.target.value = "";
                },
              });
            }}
          />
          <Button
            variant="ghost"
            className="mb-1 w-full justify-start gap-2 text-[#65726c]"
            onClick={() => imageInput.current?.click()}
            disabled={imageMutation.isPending}
          >
            <Camera size={16} />{" "}
            {imageMutation.isPending
              ? "Updating image..."
              : "Update profile image"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-[#65726c]"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-62">
        <header className="sticky top-0 z-20 border-b border-[#dfe6e2] bg-[#fbfcfb]/95 backdrop-blur">
          <div className="flex h-14.5 items-center justify-between px-4 sm:px-7">
            <div className="flex items-center gap-2 lg:hidden">
              <span className="grid size-8 place-items-center rounded bg-[#123d32] text-white">
                <Scale size={17} />
              </span>
              <span className="text-sm font-semibold">Justice Desk</span>
            </div>
            <p className="hidden text-xs text-[#738079] lg:block">
              {roleTitle[userRole]}
            </p>
            <div className="flex items-center gap-3">
              <span className="hidden text-[13px] text-[#57655e] sm:block">
                {user?.name}
              </span>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs text-[#69766f] hover:text-[#174638]"
              >
                Public site <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
            {navigation.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`shrink-0 rounded px-3 py-1.5 text-xs ${pathname === href ? "bg-[#e7efeb] font-semibold text-[#174638]" : "text-[#647169] hover:bg-[#f0f4f1]"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto min-h-[calc(100vh-58px)] max-w-360 px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
