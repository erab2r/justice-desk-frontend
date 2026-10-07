import { useState } from "react";
import CreateScheduleForm from "@/components/form/create-schedule-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ScheduleCreateDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" />}>
        Create Schedule
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
          <DialogDescription>
            Clients can book this schedule after it is published.
          </DialogDescription>
        </DialogHeader>
        <CreateScheduleForm handleClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
