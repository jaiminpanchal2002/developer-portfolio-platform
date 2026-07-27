"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEducation } from "@/services/educationService";
import { Education } from "@/types";
import { educationSchema, EducationFormValues } from "@/lib/validation/educationSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

interface Props {
  education: Education;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEducationForm({
  education,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: education.institution || "",
      degree: education.degree || "",
      fieldOfStudy: education.fieldOfStudy || "",
      startYear: education.startYear || new Date().getFullYear() - 4,
      endYear: education.endYear || new Date().getFullYear(),
      grade: education.grade || "",
    },
  });

  const onSubmit = async (values: EducationFormValues) => {
    try {
      await updateEducation(education.id, values);
      toastSuccess("Education updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to update education");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Institution" htmlFor="edit-institution" required error={errors.institution?.message}>
        <input
          id="edit-institution"
          {...register("institution")}
          aria-invalid={!!errors.institution}
          className={inputClass(!!errors.institution)}
        />
      </Field>

      <Field label="Degree" htmlFor="edit-degree" required error={errors.degree?.message}>
        <input
          id="edit-degree"
          {...register("degree")}
          aria-invalid={!!errors.degree}
          className={inputClass(!!errors.degree)}
        />
      </Field>

      <Field label="Field of Study" htmlFor="edit-fieldOfStudy" error={errors.fieldOfStudy?.message}>
        <input
          id="edit-fieldOfStudy"
          {...register("fieldOfStudy")}
          aria-invalid={!!errors.fieldOfStudy}
          className={inputClass(!!errors.fieldOfStudy)}
        />
      </Field>

      <Field label="Start Year" htmlFor="edit-startYear" required error={errors.startYear?.message}>
        <input
          id="edit-startYear"
          type="number"
          {...register("startYear", { valueAsNumber: true })}
          aria-invalid={!!errors.startYear}
          className={inputClass(!!errors.startYear)}
        />
      </Field>

      <Field label="End Year" htmlFor="edit-endYear" required error={errors.endYear?.message}>
        <input
          id="edit-endYear"
          type="number"
          {...register("endYear", { valueAsNumber: true })}
          aria-invalid={!!errors.endYear}
          className={inputClass(!!errors.endYear)}
        />
      </Field>

      <Field label="Grade / CGPA" htmlFor="edit-grade" error={errors.grade?.message}>
        <input
          id="edit-grade"
          {...register("grade")}
          aria-invalid={!!errors.grade}
          className={inputClass(!!errors.grade)}
        />
      </Field>

      <div className={stickyFooterClass}>
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Saving…" : "Update Education"}
        </button>
      </div>
    </form>
  );
}
