"use client";

import { Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCaseNotes, useCreateCaseNote } from "@/hooks/case.hook";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { UserRole } from "@/services/justice.service";
import { CaseObjectList, caseInputClass, caseLabelClass } from "./case-ui";

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
