import z from "zod";

export const scheduleSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    totalSlots: z
      .string()
      .regex(/^[1-9]\d*$/, "Slots must be a positive whole number"),
    meetingLink: z.url("Meeting link must be a valid URL"),
  })
  .refine(
    ({ date, startTime, endTime }) =>
      new Date(`${date}T${endTime}`).getTime() >
      new Date(`${date}T${startTime}`).getTime(),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );
