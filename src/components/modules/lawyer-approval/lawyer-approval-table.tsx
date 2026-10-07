import { SearchX } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/ui/table-pagination";
import { useSuspenseGetAllLawyers } from "@/hooks";
import type { LawyerParams } from "@/types";

interface Props extends LawyerParams {
  handleReview: Dispatch<SetStateAction<string>>;
  handlePageChange: Dispatch<SetStateAction<number>>;
}

export default function LawyerApprovalTable({
  handleReview,
  handlePageChange,
  ...params
}: Props) {
  const { data } = useSuspenseGetAllLawyers(params);

  const lawyers = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 0;
  const isEmpty = lawyers.length === 0;

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>License No.</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact No.</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                    <span className="rounded-full bg-muted p-3">
                      <SearchX className="size-5 text-muted-foreground" />
                    </span>
                    <p className="font-medium">No lawyers found</p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      {params.email
                        ? `No results for "${params.email}". Try a different email.`
                        : "There are no lawyers in this view yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              lawyers.map((lawyer) => (
                <TableRow key={lawyer.id}>
                  <TableCell className="font-medium">{lawyer.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {lawyer.licenseNumber}
                  </TableCell>
                  <TableCell
                    className="max-w-[220px] truncate text-muted-foreground"
                    title={lawyer.user?.email}
                  >
                    {lawyer.user?.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lawyer.contactNumber ? lawyer.contactNumber : "-"}
                  </TableCell>
                  <TableCell>
                    {lawyer.specializations
                      ?.map(({ specialization }) => specialization.name)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {lawyer.user?.emailVerified ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(lawyer.id)}
                        disabled={lawyer.verificationStatus !== "PENDING"}
                      >
                        Review
                      </Button>
                    ) : (
                      <Button disabled variant="outline" size="sm">
                        Not Verified
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="my-5">
          <TablePagination
            page={params.page ?? 1}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}