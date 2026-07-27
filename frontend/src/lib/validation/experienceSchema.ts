import { z } from "zod";
import { requiredText } from "./common";

export const experienceSchema = z
  .object({
    company: requiredText("Company", 2, 150),
    position: requiredText("Position", 2, 150),
    description: z.string().trim().max(2000, "Must be under 2000 characters"),
    startDate: z.string().trim().min(1, "Start date is required"),
    endDate: z.string().trim(),
    currentlyWorking: z.boolean(),
  })
  .refine(
    (data) => data.currentlyWorking || data.endDate !== "",
    { message: "End date is required unless this is a current role", path: ["endDate"] }
  )
  .refine(
    (data) => data.endDate === "" || data.startDate <= data.endDate,
    { message: "End date can't be before the start date", path: ["endDate"] }
  );

export type ExperienceFormValues = z.infer<typeof experienceSchema>;

export const experienceDefaultValues: ExperienceFormValues = {
  company: "",
  position: "",
  description: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
};
