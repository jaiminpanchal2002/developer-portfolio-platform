"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEducation } from "@/services/educationService";
import { educationDefaultValues, educationSchema, EducationFormValues } from "@/lib/validation/educationSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function EducationForm({
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: educationDefaultValues,
  });

  const onSubmit = async (values: EducationFormValues) => {
    try {
      await createEducation(values);
      toastSuccess("Education added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to save education");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Institution" htmlFor="institution" required error={errors.institution?.message}>
        <input
          id="institution"
          {...register("institution")}
          aria-invalid={!!errors.institution}
          className={inputClass(!!errors.institution)}
        />
      </Field>

      <Field label="Degree" htmlFor="degree" required error={errors.degree?.message}>
        <input
          id="degree"
          {...register("degree")}
          aria-invalid={!!errors.degree}
          className={inputClass(!!errors.degree)}
        />
      </Field>

      <Field label="Field of Study" htmlFor="fieldOfStudy" error={errors.fieldOfStudy?.message}>
        <input
          id="fieldOfStudy"
          {...register("fieldOfStudy")}
          aria-invalid={!!errors.fieldOfStudy}
          className={inputClass(!!errors.fieldOfStudy)}
        />
      </Field>

      <Field label="Start Year" htmlFor="startYear" required error={errors.startYear?.message}>
        <input
          id="startYear"
          type="number"
          {...register("startYear", { valueAsNumber: true })}
          aria-invalid={!!errors.startYear}
          className={inputClass(!!errors.startYear)}
        />
      </Field>

      <Field label="End Year" htmlFor="endYear" required error={errors.endYear?.message}>
        <input
          id="endYear"
          type="number"
          {...register("endYear", { valueAsNumber: true })}
          aria-invalid={!!errors.endYear}
          className={inputClass(!!errors.endYear)}
        />
      </Field>

      <Field label="Grade / CGPA" htmlFor="grade" error={errors.grade?.message}>
        <input
          id="grade"
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
          {isSubmitting ? "Saving…" : "Save Education"}
        </button>
      </div>
    </form>
  );
}
