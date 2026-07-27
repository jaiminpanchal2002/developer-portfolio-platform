"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCertificate } from "@/services/certificateService";
import { Certificate } from "@/types";
import { certificateSchema, CertificateFormValues } from "@/lib/validation/certificateSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

interface Props {
  certificate: Certificate;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCertificateForm({
  certificate,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      title: certificate.title || "",
      issuer: certificate.issuer || "",
      issueDate: certificate.issueDate || "",
      certificateUrl: certificate.certificateUrl || "",
    },
  });

  const onSubmit = async (values: CertificateFormValues) => {
    try {
      await updateCertificate(certificate.id, values);
      toastSuccess("Certificate updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to update certificate");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Certificate Title" htmlFor="edit-title" required error={errors.title?.message}>
        <input
          id="edit-title"
          {...register("title")}
          aria-invalid={!!errors.title}
          className={inputClass(!!errors.title)}
        />
      </Field>

      <Field label="Issuer" htmlFor="edit-issuer" required error={errors.issuer?.message}>
        <input
          id="edit-issuer"
          {...register("issuer")}
          aria-invalid={!!errors.issuer}
          className={inputClass(!!errors.issuer)}
        />
      </Field>

      <Field label="Issue Date" htmlFor="edit-issueDate" error={errors.issueDate?.message}>
        <input
          id="edit-issueDate"
          type="date"
          {...register("issueDate")}
          aria-invalid={!!errors.issueDate}
          className={inputClass(!!errors.issueDate)}
        />
      </Field>

      <Field label="Certificate URL" htmlFor="edit-certificateUrl" error={errors.certificateUrl?.message}>
        <input
          id="edit-certificateUrl"
          type="url"
          {...register("certificateUrl")}
          aria-invalid={!!errors.certificateUrl}
          className={inputClass(!!errors.certificateUrl)}
        />
      </Field>

      <div className={stickyFooterClass}>
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Saving…" : "Update Certificate"}
        </button>
      </div>
    </form>
  );
}
