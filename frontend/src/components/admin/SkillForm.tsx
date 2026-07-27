"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSkill } from "@/services/skillService";
import { skillDefaultValues, skillSchema, SkillFormValues } from "@/lib/validation/skillSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

interface SkillFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SkillForm({
  onClose,
  onSuccess,
}: SkillFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: skillDefaultValues,
  });

  const onSubmit = async (values: SkillFormValues) => {
    try {
      await createSkill(values);
      toastSuccess("Skill added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to save skill");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Skill Name" htmlFor="name" required error={errors.name?.message}>
        <input
          id="name"
          type="text"
          {...register("name")}
          aria-invalid={!!errors.name}
          className={inputClass(!!errors.name)}
        />
      </Field>

      <Field label="Category" htmlFor="category" required error={errors.category?.message} hint="e.g. Frontend, Backend, Database">
        <input
          id="category"
          type="text"
          {...register("category")}
          aria-invalid={!!errors.category}
          className={inputClass(!!errors.category)}
        />
      </Field>

      <Field label="Proficiency (0-100)" htmlFor="proficiency" required error={errors.proficiency?.message}>
        <input
          id="proficiency"
          type="number"
          min={0}
          max={100}
          {...register("proficiency", { valueAsNumber: true })}
          aria-invalid={!!errors.proficiency}
          className={inputClass(!!errors.proficiency)}
        />
      </Field>

      <div className={stickyFooterClass}>
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Saving…" : "Save Skill"}
        </button>
      </div>
    </form>
  );
}
