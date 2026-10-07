"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useGetMe } from "@/hooks";
import { dashboardPathForRole } from "@/routes/dashboard.routes";
import type { UserRole } from "@/types";
import AuthLoading from "./auth-loading";

interface IProps {
  children: ReactNode;
  roles: UserRole[];
}

export default function RoleGuard({ children, roles }: IProps) {
  const router = useRouter();

  const { data: user, isPending, isFetching, isError } = useGetMe();

  const isAuthorized = !!user && roles.includes(user.role);

  useEffect(() => {
    if (isPending || isFetching) {
      return;
    }
    if (isError || !user) {
      router.replace("/login");
      return;
    }
    if (user.needPasswordChange) {
      router.replace("/forgot-password");
      return;
    }
    if (!isAuthorized) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [isPending, isFetching, isError, user, isAuthorized, router]);

  if (isPending || isFetching) {
    return <AuthLoading />;
  }

  if (isError || !user) {
    return <AuthLoading label="Redirecting..." />;
  }

  if (user.needPasswordChange) {
    return <AuthLoading label="Password update required..." />;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return <AuthLoading label="Redirecting to your workspace..." />;
}
