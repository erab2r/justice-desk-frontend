"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useGetMe } from "@/hooks";
import AuthLoading from "./auth-loading";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isPending, isFetching, isError } = useGetMe();

  useEffect(() => {
    if (isPending || isFetching) {
      return;
    }
    if (isError || !user) {
      router.replace("/login");
    }
  }, [isPending, isFetching, isError, user, router]);

  if (isPending || isFetching) {
    return <AuthLoading />;
  }

  if (isError || !user) {
    return <AuthLoading label="Redirecting..." />;
  }

  return <>{children}</>;
}
