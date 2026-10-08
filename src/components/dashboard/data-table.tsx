import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

export interface DataColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#dfe6e2] pb-5 sm:mb-7 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#668270]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-[27px] leading-tight tracking-[-0.02em] text-[#1b3026] sm:text-[32px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#738078] sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  isLoading,
  error,
  emptyTitle = "No records yet",
  emptyDescription = "Records will appear here when available from the service.",
}: {
  columns: DataColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-xl border border-[#dfe6e2] bg-white p-4 shadow-sm">
        {[0, 1, 2, 3].map((key) => (
          <div key={key}           className="h-10 animate-pulse rounded-lg bg-[#f1f5f2]" />
        ))}
      </div>
    );
  }
  if (error)
    return (
      <div
        role="alert"
        className="rounded-r-lg border-l-2 border-[#c2725f] bg-[#fbf6f3] px-4 py-3 text-sm text-[#744d41]"
      >
        {error}
      </div>
    );
  if (!rows.length)
    return (
      <div       className="rounded-xl border border-dashed border-[#d5dfd8] bg-white px-5 py-14 text-center">
        <SearchX size={22} className="mx-auto text-[#829289]" />
        <p className="mt-3 text-sm font-medium text-[#46564c]">{emptyTitle}</p>
        <p className="mt-1 text-xs text-[#87938c]">{emptyDescription}</p>
      </div>
    );

  return (
    <div className="overflow-hidden rounded-xl border border-[#dfe6e2] bg-white shadow-[0_8px_28px_-24px_rgba(23,61,48,0.28)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-170 border-collapse text-left">
          <thead>
            <tr             className="border-b border-[#e8ede9] bg-[#f5f8f6]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#718078] ${column.className ?? ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#edf1ee] transition-colors last:border-b-0 hover:bg-[#f8faf8]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3.5 text-[13px] leading-5 text-[#38483e] ${column.className ?? ""}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusLabel({ children }: { children: string }) {
  const tone =
    children === "APPROVED" ||
    children === "PAID" ||
    children === "CONFIRMED" ||
    children === "COMPLETED" ||
    children === "PUBLISHED" ||
    children === "RESOLVED"
      ? "bg-[#e8f3ec] text-[#27603e]"
      : children === "REJECTED" ||
          children === "FAILED" ||
          children === "CANCELLED" ||
          children === "CLOSED"
        ? "bg-[#f8ece9] text-[#965044]"
        : "bg-[#f3f0e7] text-[#806c39]";
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-[10px] font-semibold tracking-[0.03em] ${tone}`}
    >
      {children.replaceAll("_", " ")}
    </span>
  );
}
