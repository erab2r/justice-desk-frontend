import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  BriefcaseBusiness,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  deleteLawyer,
  deleteLawyerDocument,
  getLawyerDocuments,
  suspendLawyer,
  updateLawyerDocuments,
  updateLawyerStatus,
  updateManagedLawyerProfile,
} from "@/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useApproveLawyer, useGetAllLawyers } from "@/hooks";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { ApproveLawyerPayload, LawyerParams } from "@/types";

interface Props extends LawyerParams {
  selectedId: string;
  onClose: () => void;
}

export default function LawyerReviewSheet({
  selectedId,
  onClose,
  ...params
}: Props) {
  const [confirmRejection, setConfirmRejection] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data } = useGetAllLawyers(params);
  const { mutate: review, isPending } = useApproveLawyer();
  const queryClient = useQueryClient();
  const documents = useQuery({
    queryKey: ["lawyer-documents", selectedId],
    queryFn: () => getLawyerDocuments(selectedId),
    enabled: Boolean(selectedId),
  });
  const profileMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateManagedLawyerProfile>[1]) =>
      updateManagedLawyerProfile(selectedId, payload),
  });
  const statusMutation = useMutation({
    mutationFn: (status: "ACTIVE" | "BLOCKED") =>
      updateLawyerStatus(selectedId, { status }),
  });
  const suspensionMutation = useMutation({
    mutationFn: (suspended: boolean) => suspendLawyer(selectedId, suspended),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteLawyer(selectedId),
  });
  const documentsMutation = useMutation({
    mutationFn: (formData: FormData) =>
      updateLawyerDocuments(selectedId, formData),
  });
  const deleteDocumentMutation = useMutation({
    mutationFn: (payload: {
      documentType: "resume" | "additionalFile";
      publicId?: string;
    }) => deleteLawyerDocument(selectedId, payload),
  });
  const [editing, setEditing] = useState(false);
  const [managementError, setManagementError] = useState("");
  const refreshLawyers = () =>
    queryClient.invalidateQueries({ queryKey: ["lawyers"] });

  const selectedLawyer = data?.data?.find((lawyer) => lawyer.id === selectedId);
  const canReview =
    selectedLawyer?.verificationStatus === "PENDING" &&
    selectedLawyer.user?.emailVerified === true;

  const handleClose = () => {
    setConfirmRejection(false);
    setRejectionReason("");
    onClose();
  };

  const handleReviewAction = (status: "APPROVED" | "REJECTED") => {
    const reviewData: ApproveLawyerPayload = {
      lawyerId: selectedId,
      verificationStatus: status,
      ...(status === "REJECTED" && { rejectionReason: rejectionReason.trim() }),
    };

    review(reviewData, {
      onSuccess: (res) => {
        if (!res.success) {
          toast.add({
            title: "Server Failure",
            description: res.message,
            type: "error",
          });
          return;
        }
        toast.add({
          title: "Lawyer application reviewed",
          description: `Application ${status.toLowerCase()}.`,
          type: "success",
        });
        handleClose();
      },
      onError: (error) => {
        toast.add({
          title: "Review failed",
          description: getApiErrorMessage(error),
          type: "error",
        });
      },
    });
  };

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManagementError("");
    const form = new FormData(event.currentTarget);
    try {
      await profileMutation.mutateAsync({
        address: String(form.get("address") ?? ""),
        contactNumber: String(form.get("contactNumber") ?? ""),
        qualifications: String(form.get("qualifications") ?? ""),
        bio: String(form.get("bio") ?? ""),
        experienceYears: Number(form.get("experienceYears")),
        consultationFee: Number(form.get("consultationFee")),
      });
      await refreshLawyers();
      setEditing(false);
      toast.add({ title: "Lawyer profile updated", type: "success" });
    } catch (error) {
      setManagementError(getApiErrorMessage(error));
    }
  }

  async function changeStatus(status: "ACTIVE" | "BLOCKED") {
    setManagementError("");
    try {
      await statusMutation.mutateAsync(status);
      await refreshLawyers();
      toast.add({
        title: `Lawyer status changed to ${status}`,
        type: "success",
      });
    } catch (error) {
      setManagementError(getApiErrorMessage(error));
    }
  }

  async function changeSuspension(suspended: boolean) {
    setManagementError("");
    try {
      await suspensionMutation.mutateAsync(suspended);
      await refreshLawyers();
      toast.add({
        title: suspended ? "Lawyer suspended" : "Lawyer unsuspended",
        type: "success",
      });
    } catch (error) {
      setManagementError(getApiErrorMessage(error));
    }
  }

  async function removeLawyer() {
    if (!window.confirm("Delete this lawyer? This action cannot be undone."))
      return;
    setManagementError("");
    try {
      await deleteMutation.mutateAsync();
      await refreshLawyers();
      toast.add({ title: "Lawyer deleted", type: "success" });
      handleClose();
    } catch (error) {
      setManagementError(getApiErrorMessage(error));
    }
  }

  async function uploadDocuments(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManagementError("");
    const formData = new FormData(event.currentTarget);
    if (!formData.get("resume") && !formData.get("additionalFiles")) return;
    try {
      await documentsMutation.mutateAsync(formData);
      await queryClient.invalidateQueries({
        queryKey: ["lawyer-documents", selectedId],
      });
      toast.add({ title: "Documents updated", type: "success" });
      event.currentTarget.reset();
    } catch (error) {
      setManagementError(getApiErrorMessage(error));
    }
  }

  async function removeDocument(
    documentType: "resume" | "additionalFile",
    publicId?: string,
  ) {
    try {
      await deleteDocumentMutation.mutateAsync({ documentType, publicId });
      await queryClient.invalidateQueries({
        queryKey: ["lawyer-documents", selectedId],
      });
      toast.add({ title: "Document deleted", type: "success" });
    } catch (error) {
      setManagementError(getApiErrorMessage(error));
    }
  }

  if (!selectedLawyer) {
    return null;
  }

  const detailRow = (label: string, value?: string | number | null) => (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium wrap-break-words">
        {value ?? <span className="font-normal text-muted-foreground">—</span>}
      </span>
    </div>
  );

  return (
    <Sheet open={!!selectedId} onOpenChange={handleClose}>
      <SheetContent side="right" className="gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Review lawyer application</SheetTitle>
          <SheetDescription>
            Verify the details below before approving or rejecting. This action
            cannot be undone.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-primary/10 p-2.5">
              <BriefcaseBusiness className="size-5 text-primary" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{selectedLawyer.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedLawyer.specializations
                  ?.map(({ specialization }) => specialization.name)
                  .join(", ") || "Practice area pending"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Contact
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <span
                className="truncate"
                title={selectedLawyer.user?.email ?? selectedLawyer.email}
              >
                {selectedLawyer.user?.email ?? selectedLawyer.email ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="size-4 shrink-0 text-muted-foreground" />
              <span>{selectedLawyer.contactNumber ?? "—"}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Credentials
            </p>
            {detailRow("License no.", selectedLawyer.licenseNumber)}
            {detailRow("Qualifications", selectedLawyer.qualifications)}
            {detailRow(
              "Experience",
              selectedLawyer.experienceYears != null
                ? `${selectedLawyer.experienceYears} yrs`
                : null,
            )}
            {detailRow(
              "Consultation fee",
              selectedLawyer.consultationFee != null
                ? `BDT ${selectedLawyer.consultationFee}`
                : null,
            )}
          </div>

          {selectedLawyer.bio && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Bio
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedLawyer.bio}
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Documents
            </p>
            {documents.data?.data.resume ? (
              <a
                href={documents.data.data.resume.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FileText className="size-4 shrink-0" />
                Open resume
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                No resume uploaded
              </p>
            )}
            {documents.data?.data.additionalFiles.length ? (
              <div className="space-y-2">
                {documents.data.data.additionalFiles.map((file, index) => (
                  <a
                    key={file.publicId ?? file.url}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="size-4 shrink-0" />
                    Open supporting file {index + 1}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No supporting files uploaded
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Management
            </p>
            {managementError && (
              <p role="alert" className="text-sm text-destructive">
                {managementError}
              </p>
            )}
            {!editing ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  Edit profile
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    void changeSuspension(
                      selectedLawyer.user?.status !== "BLOCKED",
                    )
                  }
                  disabled={suspensionMutation.isPending}
                >
                  {selectedLawyer.user?.status === "BLOCKED"
                    ? "Unsuspend"
                    : "Suspend"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    void changeStatus(
                      selectedLawyer.user?.status === "ACTIVE"
                        ? "BLOCKED"
                        : "ACTIVE",
                    )
                  }
                  disabled={statusMutation.isPending}
                >
                  {selectedLawyer.user?.status === "ACTIVE"
                    ? "Block account"
                    : "Activate account"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void removeLawyer()}
                  disabled={deleteMutation.isPending}
                >
                  Delete lawyer
                </Button>
              </div>
            ) : (
              <form onSubmit={saveProfile} className="space-y-2">
                {(
                  ["address", "contactNumber", "qualifications", "bio"] as const
                ).map((field) => (
                  <input
                    key={field}
                    name={field}
                    defaultValue={selectedLawyer[field] ?? ""}
                    placeholder={field}
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  />
                ))}
                <div className="flex gap-2">
                  <input
                    name="experienceYears"
                    type="number"
                    defaultValue={selectedLawyer.experienceYears ?? ""}
                    placeholder="Experience years"
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  />
                  <input
                    name="consultationFee"
                    type="number"
                    defaultValue={selectedLawyer.consultationFee ?? ""}
                    placeholder="Consultation fee"
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={profileMutation.isPending}>
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
            <form onSubmit={uploadDocuments} className="space-y-2">
              <input name="resume" type="file" className="w-full text-sm" />
              <input
                name="additionalFiles"
                type="file"
                multiple
                className="w-full text-sm"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={documentsMutation.isPending}
              >
                Upload documents
              </Button>
            </form>
            {documents.data?.data.resume && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void removeDocument("resume")}
                disabled={deleteDocumentMutation.isPending}
              >
                Delete resume
              </Button>
            )}
            {documents.data?.data.additionalFiles.map((file) => (
              <Button
                key={file.publicId}
                type="button"
                variant="ghost"
                onClick={() =>
                  void removeDocument("additionalFile", file.publicId)
                }
                disabled={deleteDocumentMutation.isPending}
              >
                Delete supporting file
              </Button>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Verification
            </p>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
              <span>{selectedLawyer.verificationStatus}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BadgeCheck className="size-4 shrink-0 text-muted-foreground" />
              <span>
                {selectedLawyer.user?.emailVerified
                  ? "Email verified"
                  : "Email not verified"}
              </span>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t">
          {confirmRejection ? (
            <div className="flex w-full flex-col gap-3">
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this lawyer application is being rejected..."
                rows={4}
                maxLength={500}
                disabled={isPending || !canReview}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled={isPending || !canReview}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReviewAction("REJECTED")}
                  variant="destructive"
                  size="lg"
                  className="flex-1"
                  disabled={rejectionReason.trim().length < 3 || isPending}
                >
                  {isPending && <Spinner />}
                  {isPending ? "Rejecting…" : "Confirm Rejection"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full gap-2">
              <Button
                onClick={() => setConfirmRejection(true)}
                variant="destructive"
                size="lg"
                className="flex-1"
                disabled={isPending || !canReview}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleReviewAction("APPROVED")}
                variant="default"
                size="lg"
                className="flex-1"
                disabled={isPending || !canReview}
              >
                {isPending && <Spinner />}
                {isPending ? "Approving…" : "Approve"}
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
