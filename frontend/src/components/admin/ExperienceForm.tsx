"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExperience } from "@/services/experienceService";
import { experienceDefaultValues, experienceSchema, ExperienceFormValues } from "@/lib/validation/experienceSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExperienceForm({
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: experienceDefaultValues,
  });

  const currentlyWorking = watch("currentlyWorking");

  const onSubmit = async (values: ExperienceFormValues) => {
    try {
      await createExperience(values);
      toastSuccess("Experience added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to save experience");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Company" htmlFor="company" required error={errors.company?.message}>
        <input
          id="company"
          type="text"
          {...register("company")}
          aria-invalid={!!errors.company}
          className={inputClass(!!errors.company)}
        />
      </Field>

      <Field label="Position" htmlFor="position" required error={errors.position?.message}>
        <input
          id="position"
          type="text"
          {...register("position")}
          aria-invalid={!!errors.position}
          className={inputClass(!!errors.position)}
        />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description?.message}>
        <textarea
          id="description"
          {...register("description")}
          aria-invalid={!!errors.description}
          rows={4}
          className={inputClass(!!errors.description)}
        />
      </Field>

      <Field label="Start Date" htmlFor="startDate" required error={errors.startDate?.message}>
        <input
          id="startDate"
          type="date"
          {...register("startDate")}
          aria-invalid={!!errors.startDate}
          className={inputClass(!!errors.startDate)}
        />
      </Field>

      <Field label="End Date" htmlFor="endDate" error={errors.endDate?.message} required={!currentlyWorking}>
        <input
          id="endDate"
          type="date"
          disabled={currentlyWorking}
          {...register("endDate")}
          aria-invalid={!!errors.endDate}
          className={inputClass(!!errors.endDate) + (currentlyWorking ? " opacity-50 cursor-not-allowed" : "")}
        />
      </Field>

      <label className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={currentlyWorking}
          onChange={(e) => setValue("currentlyWorking", e.target.checked, { shouldValidate: true })}
        />
        Currently Working
      </label>

      <div className={stickyFooterClass}>
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
