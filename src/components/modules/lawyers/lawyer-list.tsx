"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSuspenseGetPublicLawyers } from "@/hooks";
import type { PublicLawyerParams } from "@/types";
import Link from "next/link";
import {
  BriefcaseBusiness,
  GraduationCap,
  Wallet,
} from "lucide-react";
import { Suspense } from "react";

export default function PublicLawyerList() {
  const queryParams: PublicLawyerParams = {
    page: 1,
    limit: 100,
  };

  return (
    <div>
      <Suspense fallback={<PublicLawyerListLoading />}>
        <PublicLawyerGrid {...queryParams} />
      </Suspense>
    </div>
  );
}

function PublicLawyerGrid(params: PublicLawyerParams) {
  const { data } = useSuspenseGetPublicLawyers(params);

  const lawyers = data?.data ?? [];

  if (lawyers.length === 0) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        No lawyers found.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lawyers.map((lawyer) => (
          <Card key={lawyer.id}>
            <CardHeader>
              <CardTitle>{lawyer.name}</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <BriefcaseBusiness className="size-3.5" />
                {lawyer.specializations
                  ?.map(({ specialization }) => specialization.name)
                  .join(", ") || "Legal practice"}
              </CardDescription>
              <p className="text-xs font-medium text-[#39715d]">Approved</p>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <GraduationCap className="size-4 shrink-0" />
                {lawyer.qualifications}
              </p>
              <p className="flex items-center gap-1.5">
                <BriefcaseBusiness className="size-4 shrink-0" />
                {lawyer.experienceYears}{" "}
                {lawyer.experienceYears === 1 ? "year" : "years"} of experience
              </p>

              <p className="flex items-center gap-1.5">
                <Wallet className="size-4 shrink-0" />
                Fee:
                {lawyer.consultationFee
                  ? `BDT ${lawyer.consultationFee}`
                  : "-"}
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                className="flex-1"
                render={
                  <Link href="/client/lawyers">Open lawyer directory</Link>
                }
                nativeButton={false}
              >
                Open lawyer directory
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PublicLawyerListLoading() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="space-y-2 rounded-xl border p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}