import { z } from "zod";
import { optionalUrl, requiredText } from "./common";

export const certificateSchema = z.object({
  title: requiredText("Title", 2, 200),
  issuer: requiredText("Issuer", 2, 150),
  issueDate: z.string().trim(),
  certificateUrl: optionalUrl("Certificate URL"),
});

export type CertificateFormValues = z.infer<typeof certificateSchema>;

export const certificateDefaultValues: CertificateFormValues = {
  title: "",
  issuer: "",
  issueDate: "",
  certificateUrl: "",
};
