"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProject } from "@/services/projectService";
import { uploadImage } from "@/services/uploadService";
import { projectDefaultValues, projectSchema, ProjectFormValues } from "@/lib/validation/projectSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import ImageDropzone from "@/components/admin/form/ImageDropzone";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

const DESCRIPTION_MAX = 3000;

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function ProjectForm({
  onClose,
  onSuccess,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: projectDefaultValues,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const featured = watch("featured");
  const published = watch("published");
  const description = watch("description");

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toastError("Please choose an image file");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toastError("Image must be smaller than 5MB");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setValue("imageUrl", imageUrl, { shouldValidate: true });
    } catch (error) {
      console.error(error);
      toastError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      await createProject(values);
      toastSuccess("Project added successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to save project");
    }
  };

  const busy = isSubmitting || uploading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Project Title" htmlFor="title" required error={errors.title?.message}>
        <input
          id="title"
          type="text"
          {...register("title")}
          aria-invalid={!!errors.title}
          className={inputClass(!!errors.title)}
        />
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        required
        error={errors.description?.message}
        currentLength={description?.length ?? 0}
        maxLength={DESCRIPTION_MAX}
      >
        <textarea
          id="description"
          {...register("description")}
          aria-invalid={!!errors.description}
          rows={4}
          maxLength={DESCRIPTION_MAX}
          className={inputClass(!!errors.description)}
        />
      </Field>

      <Field label="Technologies" htmlFor="technologies" error={errors.technologies?.message} hint="Comma-separated, e.g. React, Spring Boot, PostgreSQL">
        <input
          id="technologies"
          type="text"
          {...register("technologies")}
          className={inputClass(!!errors.technologies)}
        />
      </Field>

      <Field label="GitHub URL" htmlFor="githubUrl" error={errors.githubUrl?.message}>
        <input
          id="githubUrl"
          type="url"
          {...register("githubUrl")}
          aria-invalid={!!errors.githubUrl}
          className={inputClass(!!errors.githubUrl)}
        />
      </Field>

      <Field label="Live URL" htmlFor="liveUrl" error={errors.liveUrl?.message}>
        <input
          id="liveUrl"
          type="url"
          {...register("liveUrl")}
          aria-invalid={!!errors.liveUrl}
          className={inputClass(!!errors.liveUrl)}
        />
      </Field>

      <ImageDropzone
        label="Project Image"
        previewUrl={preview}
        uploading={uploading}
        onFileSelected={handleImageUpload}
        onClear={() => {
          setPreview(null);
          setValue("imageUrl", "", { shouldValidate: true });
        }}
        hint="PNG or JPG, up to 5MB"
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setValue("featured", e.target.checked)}
        />
        Featured Project
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setValue("published", e.target.checked)}
        />
        Published
        <span className="text-xs text-[var(--noir-fg-muted)]">
          (uncheck to save as a draft — hidden from the public site, previewable via its case-study link)
        </span>
      </label>

      {/* Case-study narrative — optional, powers /projects/{id} */}
      <details className="rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)]/50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--noir-fg)]">
          Case Study (optional)
        </summary>
        <div className="mt-3 space-y-3">
          <Field label="The Problem" htmlFor="problemStatement" error={errors.problemStatement?.message}>
            <textarea
              id="problemStatement"
              placeholder="What pain did this project solve?"
              {...register("problemStatement")}
              className={inputClass(!!errors.problemStatement)}
              rows={3}
            />
          </Field>
          <Field label="The Solution" htmlFor="solution" error={errors.solution?.message}>
            <textarea
              id="solution"
              placeholder="How did you solve it?"
              {...register("solution")}
              className={inputClass(!!errors.solution)}
              rows={3}
            />
          </Field>
          <Field label="Architecture" htmlFor="architecture" error={errors.architecture?.message}>
            <textarea
              id="architecture"
              placeholder="Stack decisions, data flow, infrastructure"
              {...register("architecture")}
              className={inputClass(!!errors.architecture)}
              rows={3}
            />
          </Field>
          <Field label="Challenges" htmlFor="challenges" error={errors.challenges?.message}>
            <textarea
              id="challenges"
              placeholder="The hard parts and how you got through them"
              {...register("challenges")}
              className={inputClass(!!errors.challenges)}
              rows={3}
            />
          </Field>
          <Field label="Learnings" htmlFor="learnings" error={errors.learnings?.message}>
            <textarea
              id="learnings"
              placeholder="What you'd do differently"
              {...register("learnings")}
              className={inputClass(!!errors.learnings)}
              rows={3}
            />
          </Field>
          <Field label="Metrics" htmlFor="metrics" error={errors.metrics?.message}>
            <textarea
              id="metrics"
              placeholder={"One per line, e.g.\n40% faster page loads\n99.9% uptime over 6 months"}
              {...register("metrics")}
              className={inputClass(!!errors.metrics)}
              rows={3}
            />
          </Field>
        </div>
      </details>

      <div className={stickyFooterClass}>
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {uploading ? "Uploading image…" : isSubmitting ? "Saving…" : "Save Project"}
        </button>
      </div>
    </form>
  );
}
