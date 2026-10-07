"use client";

import { ArrowUpRight, LogOut, Menu, Scale, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCurrentUser, useLogout } from "@/hooks";
import { dashboardPathForRole } from "@/routes/dashboard.routes";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: user, isPending, isFetching } = useCurrentUser();
  const logoutMutation = useLogout();

  const accountActionsPending = !user && (isPending || isFetching);

  return (
    <header className="relative z-30 border-b border-[#e3e9e5] bg-[#fbfcfb]">
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold text-[#1b392e]"
        >
          <span className="grid size-8 place-items-center rounded bg-[#123d32] text-white">
            <Scale size={17} />
          </span>
          Justice Desk
        </Link>
        <nav className="hidden items-center gap-7 text-[13px] text-[#5e6a63] md:flex">
          <Link href="/#counsel" className="hover:text-[#174638]">
            Find counsel
          </Link>
          <Link href="/about-us" className="hover:text-[#174638]">
            About
          </Link>
          <Link href="/apply" className="hover:text-[#174638]">
            For lawyers
          </Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <div className="flex max-w-44 items-center gap-2 text-[13px] font-medium text-[#385447]">
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e5eee8] text-[#174638]">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound size={17} />
                  )}
                </span>
                <span className="truncate">Hi, {user.name}</span>
              </div>
              <Link
                href={dashboardPathForRole(user.role)}
                className="inline-flex h-9 items-center rounded-md px-3 text-[13px] text-[#385447] hover:bg-[#eef3ef]"
              >
                Workspace
              </Link>
              <button
                type="button"
                aria-label="Sign out"
                title="Sign out"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                className="grid size-9 place-items-center rounded-md text-[#385447] hover:bg-[#eef3ef] disabled:opacity-50"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : accountActionsPending ? (
            <span className="size-9" aria-hidden="true" />
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-md px-3 text-[13px] text-[#385447] hover:bg-[#eef3ef]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[#174638] px-4 text-[13px] font-medium text-white hover:bg-[#10372c]"
              >
                Create account <ArrowUpRight size={14} />
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="grid size-9 place-items-center rounded-md text-[#315344] hover:bg-[#eef3ef] md:hidden"
        >
          <Menu size={19} />
        </button>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-[#e3e9e5] bg-[#fbfcfb] p-3 md:hidden">
          <Link
            onClick={() => setOpen(false)}
            className="rounded px-3 py-2.5 text-sm text-[#42564b] hover:bg-[#eef3ef]"
            href="/#counsel"
          >
            Find counsel
          </Link>
          <Link
            onClick={() => setOpen(false)}
            className="rounded px-3 py-2.5 text-sm text-[#42564b] hover:bg-[#eef3ef]"
            href="/about-us"
          >
            About
          </Link>
          <Link
            onClick={() => setOpen(false)}
            className="rounded px-3 py-2.5 text-sm text-[#42564b] hover:bg-[#eef3ef]"
            href="/apply"
          >
            For lawyers
          </Link>
          <div className="mt-1 flex items-center gap-2 px-2">
            {user ? (
              <>
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e5eee8] text-[#174638]">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound size={17} />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#385447]">
                  Hi, {user.name}
                </span>
                <Link
                  href={dashboardPathForRole(user.role)}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 items-center rounded-md px-3 text-sm text-[#385447] hover:bg-[#eef3ef]"
                >
                  Workspace
                </Link>
                <button
                  type="button"
                  aria-label="Sign out"
                  title="Sign out"
                  disabled={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                  className="grid size-9 shrink-0 place-items-center rounded-md text-[#385447] hover:bg-[#eef3ef] disabled:opacity-50"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : accountActionsPending ? (
              <span className="h-9" aria-hidden="true" />
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-9 flex-1 items-center justify-center rounded-md border border-[#d9e2dc] text-sm"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 flex-1 items-center justify-center rounded-md bg-[#174638] text-sm text-white"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
