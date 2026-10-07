"use client";

import { Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { DataTable, StatusLabel } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import {
  useCaseInvoices,
  useCaseNotes,
  useCreateCaseInvoice,
  useCreateCaseNote,
} from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { Invoice, UserRole } from "@/services/justice.service";
import { CaseObjectList, caseInputClass, caseLabelClass } from "./case-ui";

export function CaseBilling({
  caseId,
  clientId,
  lawyerId,
  role,
  active,
}: {
  caseId: string;
  clientId?: string;
  lawyerId?: string;
  role: UserRole;
  active: boolean;
}) {
  const invoices = useCaseInvoices(caseId, active);
  const createInvoice = useCreateCaseInvoice(caseId);
  const [open, setOpen] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clientId || !lawyerId) {
      toast.error("The case response is missing client or lawyer details.");
      return;
    }

    const form = new FormData(event.currentTarget);
    try {
      await createInvoice.mutateAsync({
        amount: Number(form.get("amount")),
        tax: Number(form.get("tax") || 0),
        currency: "BDT",
        description: String(form.get("description")),
        caseId,
        clientId,
        lawyerId,
        ...(String(form.get("dueDate") ?? "") && {
          dueDate: new Date(String(form.get("dueDate"))).toISOString(),
        }),
      });
      toast.success("Invoice created");
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const columns = [
    {
      key: "number",
      label: "Invoice",
      render: (item: Invoice) => item.invoiceNumber,
    },
    {
      key: "total",
      label: "Total",
      render: (item: Invoice) =>
        `${item.currency} ${Number(item.totalAmount).toLocaleString()}`,
    },
    {
      key: "due",
      label: "Due date",
      render: (item: Invoice) =>
        item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (item: Invoice) => <StatusLabel>{item.status}</StatusLabel>,
    },
    {
      key: "pdf",
      label: "PDF",
      render: (item: Invoice) =>
        item.pdfUrl ? (
          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#39715d] hover:underline"
          >
            Open PDF
          </a>
        ) : (
          "—"
        ),
    },
  ];

  if (!active) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-[#7b8880]">
          Invoices associated with this case.
        </p>
        {role === "LAWYER" && (
          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(!open)}
            className="gap-1.5 bg-[#174638] text-white"
          >
            <Plus size={14} /> New invoice
          </Button>
        )}
      </div>
      {open && (
        <form
          onSubmit={submit}
          className="mb-4 grid gap-3 border border-[#dfe6e2] bg-white p-4 sm:grid-cols-2"
        >
          <div>
            <label className={caseLabelClass} htmlFor="invoice-amount">
              Amount (BDT)
            </label>
            <input
              required
              min="0"
              step="0.01"
              name="amount"
              id="invoice-amount"
              type="number"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="invoice-tax">
              Tax (BDT)
            </label>
            <input
              name="tax"
              id="invoice-tax"
              min="0"
              step="0.01"
              type="number"
              defaultValue="0"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="invoice-date">
              Due date
            </label>
            <input
              name="dueDate"
              id="invoice-date"
              type="date"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="invoice-description">
              Description
            </label>
            <input
              required
              name="description"
              id="invoice-description"
              className={caseInputClass}
            />
          </div>
          <Button
            type="submit"
            disabled={createInvoice.isPending}
            className="justify-self-end bg-[#174638] text-white sm:col-span-2"
          >
            Create invoice
          </Button>
        </form>
      )}
      <DataTable
        columns={columns}
        rows={invoices.data?.data ?? []}
        isLoading={invoices.isPending}
        error={invoices.error ? getApiErrorMessage(invoices.error) : undefined}
        emptyTitle="No invoices for this case"
      />
    </section>
  );
}

export function CaseNotes({
  caseId,
  role,
  active,
}: {
  caseId: string;
  role: UserRole;
  active: boolean;
}) {
  const notes = useCaseNotes(caseId, active);
  const createNote = useCreateCaseNote(caseId);
  const [open, setOpen] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createNote.mutateAsync({
        title: String(form.get("title")),
        content: String(form.get("content")),
        isPrivate: form.get("isPrivate") === "on",
      });
      toast.success("Case note saved");
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (!active) return null;

  return (
    <section>
      <div className="mb-3 flex justify-end">
        {(role === "LAWYER" || role === "ADMIN") && (
          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(!open)}
            className="gap-1.5 bg-[#174638] text-white"
          >
            <Plus size={14} /> Add lawyer note
          </Button>
        )}
      </div>
      {open && (role === "LAWYER" || role === "ADMIN") && (
        <form
          onSubmit={submit}
          className="mb-4 grid gap-3 border border-[#dfe6e2] bg-white p-4"
        >
          <div>
            <label className={caseLabelClass} htmlFor="note-title">
              Title
            </label>
            <input
              required
              name="title"
              id="note-title"
              className={caseInputClass}
            />
          </div>
          <div>
            <label className={caseLabelClass} htmlFor="note-content">
              Note
            </label>
            <textarea
              required
              name="content"
              id="note-content"
              rows={4}
              className={`${caseInputClass} h-auto py-2.5`}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-[#5b695f]">
            <input name="isPrivate" type="checkbox" defaultChecked /> Keep
            private (uncheck to share with the client)
          </label>
          <Button
            type="submit"
            disabled={createNote.isPending}
            className="justify-self-end bg-[#174638] text-white"
          >
            Save note
          </Button>
        </form>
      )}
      <CaseObjectList
        rows={notes.data?.data ?? []}
        isLoading={notes.isPending}
        error={notes.error}
        empty="No lawyer notes returned."
      />
    </section>
  );
}
