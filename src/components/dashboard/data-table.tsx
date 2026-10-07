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
    <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#dfe6e2] pb-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#668270]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-[30px] leading-tight text-[#1b3026]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#738078]">
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
      <div className="space-y-2 rounded-md border border-[#dfe6e2] bg-white p-4">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-10 animate-pulse rounded bg-[#f1f5f2]" />
        ))}
      </div>
    );
  }
  if (error)
    return (
      <div
        role="alert"
        className="border-l-2 border-[#c2725f] bg-[#fbf6f3] px-4 py-3 text-sm text-[#744d41]"
      >
        {error}
      </div>
    );
  if (!rows.length)
    return (
      <div className="border border-dashed border-[#d5dfd8] bg-white px-5 py-14 text-center">
        <SearchX size={22} className="mx-auto text-[#829289]" />
        <p className="mt-3 text-sm font-medium text-[#46564c]">{emptyTitle}</p>
        <p className="mt-1 text-xs text-[#87938c]">{emptyDescription}</p>
      </div>
    );

  return (
    <div className="overflow-hidden rounded-md border border-[#dfe6e2] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-170 border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e8ede9] bg-[#f7f9f7]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-[#77837c] ${column.className ?? ""}`}
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
                className="border-b border-[#edf1ee] last:border-b-0 hover:bg-[#fbfcfb]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3.5 text-[13px] text-[#38483e] ${column.className ?? ""}`}
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
      className={`inline-flex rounded px-2 py-1 text-[10px] font-semibold tracking-[0.03em] ${tone}`}
    >
      {children.replaceAll("_", " ")}
    </span>
  );
}
