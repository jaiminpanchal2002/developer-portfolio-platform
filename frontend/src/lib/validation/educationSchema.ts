import { z } from "zod";
import { requiredText } from "./common";

const currentYear = new Date().getFullYear();

export const educationSchema = z
  .object({
    institution: requiredText("Institution", 2, 150),
    degree: requiredText("Degree", 2, 150),
    fieldOfStudy: z.string().trim().max(150, "Must be under 150 characters"),
    startYear: z
      .number({ message: "Start year must be a number" })
      .int()
      .min(1950, "Enter a realistic year")
      .max(currentYear + 10, "Enter a realistic year"),
    endYear: z
      .number({ message: "End year must be a number" })
      .int()
      .min(1950, "Enter a realistic year")
      .max(currentYear + 10, "Enter a realistic year"),
    grade: z.string().trim().max(50, "Must be under 50 characters"),
  })
  .refine((data) => data.endYear >= data.startYear, {
    message: "End year can't be before the start year",
    path: ["endYear"],
  });

export type EducationFormValues = z.infer<typeof educationSchema>;

export const educationDefaultValues: EducationFormValues = {
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startYear: currentYear - 4,
  endYear: currentYear,
  grade: "",
};
