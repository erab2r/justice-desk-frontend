"use client";

import { Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { useCaseDocuments, useCreateCaseDocument } from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import { isDocumentType, type LegalDocument } from "@/types/case.type";
import { caseInputClass, caseLabelClass } from "./case-ui";

export function CaseDocuments({
  caseId,
  active,
}: {
  caseId: string;
  active: boolean;
}) {
  const documents = useCaseDocuments(caseId, active);
  const createDocument = useCreateCaseDocument(caseId);
  const [open, setOpen] = useState(false);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const documentType = String(form.get("documentType"));
    if (!isDocumentType(documentType)) {
      toast.error("Select a valid document type");
      return;
    }
    try {
      await createDocument.mutateAsync({
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
          ...(String(form.get("fileSize") ?? "").trim() && {
            fileSize: Number(form.get("fileSize")),
          }),
        },
      });
      toast.success("Document record added");
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

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
  ];

  if (!active) return null;

  return (
    <div>
      <div className="mb-3 flex justify-between">
        <p className="text-xs text-[#7b8880]">
          Links and metadata stored against this case.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => setOpen(!open)}
          className="gap-1.5 bg-[#174638] text-white"
        >
          <Plus size={14} /> Add document record
        </Button>
      </div>
      {open && (
        <form
          onSubmit={create}
          className="mb-4 grid gap-3 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-2"
        >
          <div>
            <label className={caseLabelClass} htmlFor="case-document-title">
              Title
            </label>
            <input
              required
              name="title"
              id="case-document-title"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="case-document-type">
              Type
            </label>
            <select
              name="documentType"
              id="case-document-type"
              className={caseInputClass}
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
            <label className={caseLabelClass} htmlFor="case-document-url">
              File URL
            </label>
            <input
              required
              name="fileUrl"
              id="case-document-url"
              type="url"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="case-document-desc">
              Description
            </label>
            <input
              name="description"
              id="case-document-desc"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="case-document-public-id">
              File public ID
            </label>
            <input
              name="filePublicId"
              id="case-document-public-id"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="case-document-file-type">
              MIME type
            </label>
            <input
              name="fileType"
              id="case-document-file-type"
              placeholder="application/pdf"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="case-document-file-size">
              File size (bytes)
            </label>
            <input
              name="fileSize"
              id="case-document-file-size"
              type="number"
              min="0"
              className={caseInputClass}
            />
          </div>
          <p className="text-[10px] text-[#819087] sm:col-span-2">
            Add the document URL and metadata. Direct file upload is not
            available through this API.
          </p>
          <Button
            type="submit"
            disabled={createDocument.isPending}
            className="justify-self-end bg-[#174638] text-white sm:col-span-2"
          >
            {createDocument.isPending ? "Saving..." : "Add record"}
          </Button>
        </form>
      )}
      <DataTable
        columns={columns}
        rows={documents.data?.data ?? []}
        isLoading={documents.isPending}
        error={
          documents.error ? getApiErrorMessage(documents.error) : undefined
        }
        emptyTitle="No case documents"
      />
    </div>
  );
}
