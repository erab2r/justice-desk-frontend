"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  handlePageChange: Dispatch<SetStateAction<number>>;
}

export default function TablePagination({
  page,
  totalPages,
  handlePageChange,
}: TablePaginationProps) {
  return (
    <nav
      aria-label="Table pagination"
      className="flex items-center justify-center gap-3"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => handlePageChange((currentPage) => currentPage - 1)}
      >
        <ChevronLeft aria-hidden="true" />
        Previous
      </Button>
      <span aria-live="polite" className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => handlePageChange((currentPage) => currentPage + 1)}
      >
        Next
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
