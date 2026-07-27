"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateExperience } from "@/services/experienceService";
import { Experience } from "@/types";
import { experienceSchema, ExperienceFormValues } from "@/lib/validation/experienceSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

interface Props {
  experience: Experience;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditExperienceForm({
  experience,
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
    defaultValues: {
      company: experience.company || "",
      position: experience.position || "",
      description: experience.description || "",
      startDate: experience.startDate || "",
      endDate: experience.endDate || "",
      currentlyWorking: experience.currentlyWorking || false,
    },
  });

  const currentlyWorking = watch("currentlyWorking");

  const onSubmit = async (values: ExperienceFormValues) => {
    try {
      await updateExperience(experience.id, values);
      toastSuccess("Experience updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to update experience");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Company" htmlFor="edit-company" required error={errors.company?.message}>
        <input
          id="edit-company"
          type="text"
          {...register("company")}
          aria-invalid={!!errors.company}
          className={inputClass(!!errors.company)}
        />
      </Field>

      <Field label="Position" htmlFor="edit-position" required error={errors.position?.message}>
        <input
          id="edit-position"
          type="text"
          {...register("position")}
          aria-invalid={!!errors.position}
          className={inputClass(!!errors.position)}
        />
      </Field>

      <Field label="Description" htmlFor="edit-description" error={errors.description?.message}>
        <textarea
          id="edit-description"
          {...register("description")}
          aria-invalid={!!errors.description}
          rows={4}
          className={inputClass(!!errors.description)}
        />
      </Field>

      <Field label="Start Date" htmlFor="edit-startDate" required error={errors.startDate?.message}>
        <input
          id="edit-startDate"
          type="date"
          {...register("startDate")}
          aria-invalid={!!errors.startDate}
          className={inputClass(!!errors.startDate)}
        />
      </Field>

      <Field label="End Date" htmlFor="edit-endDate" error={errors.endDate?.message} required={!currentlyWorking}>
        <input
          id="edit-endDate"
          type="date"
          disabled={currentlyWorking}
          {...register("endDate")}
          aria-invalid={!!errors.endDate}
          className={inputClass(!!errors.endDate) + (currentlyWorking ? " opacity-50 cursor-not-allowed" : "")}
        />
      </Field>

      <label className="flex items-center gap-2">
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
          {isSubmitting ? "Saving…" : "Update Experience"}
        </button>
      </div>
    </form>
  );
}
