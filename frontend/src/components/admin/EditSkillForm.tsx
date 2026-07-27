"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSkill } from "@/services/skillService";
import { Skill } from "@/types";
import { skillSchema, SkillFormValues } from "@/lib/validation/skillSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

interface Props {
  skill: Skill;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSkillForm({
  skill,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
    },
  });

  const onSubmit = async (values: SkillFormValues) => {
    try {
      await updateSkill(skill.id, values);
      toastSuccess("Skill updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to update skill");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Skill Name" htmlFor="edit-name" required error={errors.name?.message}>
        <input
          id="edit-name"
          type="text"
          {...register("name")}
          aria-invalid={!!errors.name}
          className={inputClass(!!errors.name)}
        />
      </Field>

      <Field label="Category" htmlFor="edit-category" required error={errors.category?.message}>
        <input
          id="edit-category"
          type="text"
          {...register("category")}
          aria-invalid={!!errors.category}
          className={inputClass(!!errors.category)}
        />
      </Field>

      <Field label="Proficiency (0-100)" htmlFor="edit-proficiency" required error={errors.proficiency?.message}>
        <input
          id="edit-proficiency"
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
          {isSubmitting ? "Saving…" : "Update Skill"}
        </button>
      </div>
    </form>
  );
}
