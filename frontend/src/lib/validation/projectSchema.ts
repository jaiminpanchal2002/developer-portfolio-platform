import { z } from "zod";
import { optionalText, optionalUrl, requiredText } from "./common";

export const projectSchema = z.object({
  title: requiredText("Title", 3, 150),
  description: requiredText("Description", 10, 3000),
  technologies: optionalText(300),
  githubUrl: optionalUrl("GitHub URL"),
  liveUrl: optionalUrl("Live URL"),
  imageUrl: z.string(),
  featured: z.boolean(),
  published: z.boolean(),
  problemStatement: optionalText(3000),
  solution: optionalText(3000),
  architecture: optionalText(3000),
  challenges: optionalText(3000),
  learnings: optionalText(3000),
  metrics: optionalText(3000),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const projectDefaultValues: ProjectFormValues = {
  title: "",
  description: "",
  technologies: "",
  githubUrl: "",
  liveUrl: "",
  imageUrl: "",
  featured: false,
  published: true,
  problemStatement: "",
  solution: "",
  architecture: "",
  challenges: "",
  learnings: "",
  metrics: "",
};
