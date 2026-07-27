import { z } from "zod";
import { requiredText } from "./common";

export const skillSchema = z.object({
  name: requiredText("Skill name", 2, 100),
  category: requiredText("Category", 2, 100),
  proficiency: z
    .number({ message: "Proficiency must be a number" })
    .int("Proficiency must be a whole number")
    .min(0, "Proficiency can't be below 0")
    .max(100, "Proficiency can't be above 100"),
});

export type SkillFormValues = z.infer<typeof skillSchema>;

export const skillDefaultValues: SkillFormValues = {
  name: "",
  category: "",
  proficiency: 50,
};
