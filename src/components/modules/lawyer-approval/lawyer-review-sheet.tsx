import {
  BadgeCheck,
  BriefcaseBusiness,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
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
import { useApproveLawyer, useGetAllLawyers } from "@/hooks";
import type { ApproveLawyerPayload, LawyerParams } from "@/types";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/apiClient";

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

  const selectedLawyer = data?.data?.find((lawyer) => lawyer.id === selectedId);

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
      <SheetContent side="left" className="gap-0 sm:max-w-md">
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
                disabled={isPending}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  disabled={isPending}
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
                disabled={isPending}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleReviewAction("APPROVED")}
                variant="default"
                size="lg"
                className="flex-1"
                disabled={isPending}
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