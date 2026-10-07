"use client";

import { FilePlus2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { DataTable, PageHeading } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth.hook";
import {
  useCases,
  useCreateCaseDocument,
  useDeleteCaseDocument,
  useMyCaseDocuments,
} from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import { isDocumentType, type LegalDocument } from "@/types/case.type";

const controlClass =
  "h-10 w-full rounded-md border border-[#d9e2dc] bg-white px-3 text-sm text-[#26382d] outline-none focus:border-[#56826c] focus:ring-2 focus:ring-[#56826c]/15";
const fieldLabel = "mb-1.5 block text-[11px] font-semibold text-[#506057]";

export function DocumentsPage() {
  const { data: user } = useCurrentUser();
  const role = user?.role ?? "CLIENT";
  const documents = useMyCaseDocuments();
  const cases = useCases(role, { page: 1, limit: 100 });
  const createDocumentMutation = useCreateCaseDocument();
  const deleteDocumentMutation = useDeleteCaseDocument();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const caseId = String(form.get("caseId"));
    const documentType = String(form.get("documentType"));
    if (!isDocumentType(documentType)) {
      setError("Select a valid document type");
      setBusy(false);
      return;
    }
    try {
      await createDocumentMutation.mutateAsync({
        caseId,
        body: {
          title: String(form.get("title")),
          fileUrl: String(form.get("fileUrl")),
          documentType,
          ...(String(form.get("description") ?? "").trim() && {
            description: String(form.get("description")).trim(),
          }),
          ...(String(form.get("filePublicId") ?? "").trim() && {
            filePublicId: String(form.get("filePublicId")).trim(),
          }),
          ...(String(form.get("fileType") ?? "").trim() && {
            fileType: String(form.get("fileType")).trim(),
          }),
          ...(String(form.get("fileSize") ?? "") && {
            fileSize: Number(form.get("fileSize")),
          }),
        },
      });
      toast.success("Document record added");
      setOpen(false);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  const rows = documents.data?.data ?? [];
  const columns = [
    {
      key: "title",
      label: "Document",
      render: (item: LegalDocument) => (
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#315744] hover:underline"
        >
          {item.title}
        </a>
      ),
    },
    {
      key: "case",
      label: "Case",
      render: (item: LegalDocument) => item.case?.caseNumber ?? "—",
    },
    {
      key: "type",
      label: "Type",
      render: (item: LegalDocument) => item.documentType.replaceAll("_", " "),
    },
    {
      key: "date",
      label: "Added",
      render: (item: LegalDocument) =>
        new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: LegalDocument) =>
        role !== "CLIENT" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={
              createDocumentMutation.isPending ||
              deleteDocumentMutation.isPending
            }
            onClick={() => {
              if (!window.confirm("Remove this document record?")) return;
              deleteDocumentMutation.mutate(item.id, {
                onSuccess: () => toast.success("Document record removed"),
                onError: (caught) => toast.error(getApiErrorMessage(caught)),
              });
            }}
            className="h-7 rounded border-[#cad9cf] px-2 text-[10px] text-[#315744]"
          >
            Remove
          </Button>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div>
      <PageHeading
        eyebrow="Case files"
        title="Documents"
        description="Case document records and links stored by Justice Desk."
        action={
          <Button
            type="button"
            onClick={() => setOpen(!open)}
            className="h-9 gap-2 bg-[#174638] text-white"
          >
            <FilePlus2 size={15} /> Add document record
          </Button>
        }
      />
      {open && (
        <form
          onSubmit={create}
          className="mb-5 grid gap-3 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-2"
        >
          <div>
            <label className={fieldLabel} htmlFor="document-case">
              Case *
            </label>
            <select
              required
              name="caseId"
              id="document-case"
              className={controlClass}
            >
              <option value="">Select case</option>
              {(cases.data?.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.caseNumber} · {item.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="document-title">
              Title *
            </label>
            <input
              required
              name="title"
              id="document-title"
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="document-url">
              File URL *
            </label>
            <input
              required
              type="url"
              name="fileUrl"
              id="document-url"
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="document-type">
              Document type *
            </label>
            <select
              required
              name="documentType"
              id="document-type"
              className={controlClass}
            >
              {[
                "ID_DOCUMENT",
                "COURT_DOCUMENT",
                "EVIDENCE",
                "CONTRACT",
                "AGREEMENT",
                "LEGAL_NOTICE",
                "CASE_FILE",
                "OTHER",
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="document-file-type">
              MIME type
            </label>
            <input
              name="fileType"
              id="document-file-type"
              className={controlClass}
              placeholder="application/pdf"
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="document-public-id">
              File public ID
            </label>
            <input
              name="filePublicId"
              id="document-public-id"
              className={controlClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="document-file-size">
              File size (bytes)
            </label>
            <input
              name="fileSize"
              id="document-file-size"
              type="number"
              min="0"
              className={controlClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={fieldLabel} htmlFor="document-description">
              Description
            </label>
            <input
              name="description"
              id="document-description"
              className={controlClass}
            />
          </div>
          <p className="text-[11px] leading-5 text-[#7b8880] sm:col-span-2">
            The backend accepts document metadata and a file URL. It does not
            expose a file-upload endpoint.
          </p>
          {error && (
            <p className="text-xs text-[#985547] sm:col-span-2">{error}</p>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="bg-[#174638] text-white"
            >
              {busy ? "Saving..." : "Save record"}
            </Button>
          </div>
        </form>
      )}
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={documents.isPending}
        error={
          documents.isError ? getApiErrorMessage(documents.error) : undefined
        }
        emptyTitle="No documents returned"
        emptyDescription="Document records shared with your cases appear here."
      />
    </div>
  );
}
