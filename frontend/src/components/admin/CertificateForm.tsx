"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCertificate } from "@/services/certificateService";
import { certificateDefaultValues, certificateSchema, CertificateFormValues } from "@/lib/validation/certificateSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CertificateForm({
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: certificateDefaultValues,
  });

  const onSubmit = async (values: CertificateFormValues) => {
    try {
      await createCertificate(values);
      toastSuccess("Certificate added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to save certificate");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Certificate Title" htmlFor="title" required error={errors.title?.message}>
        <input
          id="title"
          {...register("title")}
          aria-invalid={!!errors.title}
          className={inputClass(!!errors.title)}
        />
      </Field>

      <Field label="Issuer" htmlFor="issuer" required error={errors.issuer?.message}>
        <input
          id="issuer"
          {...register("issuer")}
          aria-invalid={!!errors.issuer}
          className={inputClass(!!errors.issuer)}
        />
      </Field>

      <Field label="Issue Date" htmlFor="issueDate" error={errors.issueDate?.message}>
        <input
          id="issueDate"
          type="date"
          {...register("issueDate")}
          aria-invalid={!!errors.issueDate}
          className={inputClass(!!errors.issueDate)}
        />
      </Field>

      <Field label="Certificate URL" htmlFor="certificateUrl" error={errors.certificateUrl?.message}>
        <input
          id="certificateUrl"
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
          {isSubmitting ? "Saving…" : "Save Certificate"}
        </button>
      </div>
    </form>
  );
}
