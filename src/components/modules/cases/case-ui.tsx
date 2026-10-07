import { ExternalLink } from "lucide-react";
import { getApiErrorMessage } from "@/lib/apiClient";

export const caseInputClass =
  "h-10 w-full rounded-md border border-[#d9e2dc] bg-white px-3 text-sm text-[#26382d] outline-none focus:border-[#56826c] focus:ring-2 focus:ring-[#56826c]/15";
export const caseLabelClass =
  "mb-1.5 block text-[11px] font-semibold text-[#506057]";

export function CaseErrorMessage({ error }: { error: unknown }) {
  return (
    <p role="alert" className="text-sm text-[#985547]">
      {getApiErrorMessage(error)}
    </p>
  );
}

export function CaseEmptySection({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-[#d5dfd8] bg-white px-5 py-12 text-center text-xs text-[#87938c]">
      {text}
    </div>
  );
}

export function CaseFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.08em] text-[#87938c]">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-[#405247]">{value}</p>
    </div>
  );
}

export function CaseObjectList({
  rows,
  isLoading,
  error,
  empty,
}: {
  rows: unknown[];
  isLoading: boolean;
  error: unknown;
  empty: string;
}) {
  if (isLoading) return <div className="h-24 animate-pulse bg-white" />;
  if (error) return <CaseErrorMessage error={error} />;
  if (!rows.length) return <CaseEmptySection text={empty} />;

  return (
    <div className="space-y-2">
      {rows.map((row, index) => {
        const data =
          typeof row === "object" && row !== null
            ? (row as Record<string, unknown>)
            : { value: row };
        const primary = String(
          data.title ?? data.action ?? data.provider ?? `Record ${index + 1}`,
        );
        const detail = String(
          data.summary ?? data.content ?? data.message ?? data.roomUrl ?? "",
        );
        const date =
          typeof data.createdAt === "string"
            ? new Date(data.createdAt).toLocaleString()
            : "";

        return (
          <article
            key={String(data.id ?? index)}
            className="border border-[#dfe6e2] bg-white p-4"
          >
            <div className="flex justify-between gap-3">
              <h3 className="text-xs font-semibold text-[#3b5142]">
                {primary}
              </h3>
              {date && (
                <span className="shrink-0 text-[10px] text-[#89948d]">
                  {date}
                </span>
              )}
            </div>
            {detail && (
              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#69766e]">
                {detail}
              </p>
            )}
            {typeof data.roomUrl === "string" && (
              <a
                href={data.roomUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#39715d] hover:underline"
              >
                Open room <ExternalLink size={12} />
              </a>
            )}
            {typeof data.reportUrl === "string" && (
              <a
                href={data.reportUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-[#39715d] hover:underline"
              >
                Open report <ExternalLink size={12} />
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}
