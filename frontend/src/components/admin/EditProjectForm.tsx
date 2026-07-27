"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProject } from "@/services/projectService";
import { uploadImage } from "@/services/uploadService";
import { getImageUrl } from "@/lib/api";
import { Project } from "@/types";
import { projectSchema, ProjectFormValues } from "@/lib/validation/projectSchema";
import { toastError, toastSuccess } from "@/lib/toast";
import Field from "@/components/admin/form/Field";
import { inputClass, primaryButtonClass, secondaryButtonClass, stickyFooterClass } from "@/components/admin/form/formStyles";

interface Props {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function EditProjectForm({
  project,
  onClose,
  onSuccess,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project.title || "",
      description: project.description || "",
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      imageUrl: project.imageUrl || "",
      technologies: project.technologies || "",
      featured: project.featured || false,
      problemStatement: project.problemStatement || "",
      solution: project.solution || "",
      architecture: project.architecture || "",
      challenges: project.challenges || "",
      learnings: project.learnings || "",
      metrics: project.metrics || "",
      published: project.published !== false,
    },
  });

  const [preview, setPreview] = useState<string | null>(project.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  const featured = watch("featured");
  const published = watch("published");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      // displayOrder isn't user-edited here (drag-reorder owns it) but must be
      // preserved — the backend overwrites it unconditionally on update.
      await updateProject(project.id, { ...values, displayOrder: project.displayOrder });
      toastSuccess("Project updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toastError("Failed to update project");
    }
  };

  const busy = isSubmitting || uploading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Project Title" htmlFor="edit-title" required error={errors.title?.message}>
        <input
          id="edit-title"
          type="text"
          {...register("title")}
          aria-invalid={!!errors.title}
          className={inputClass(!!errors.title)}
        />
      </Field>

      <Field label="Description" htmlFor="edit-description" required error={errors.description?.message}>
        <textarea
          id="edit-description"
          {...register("description")}
          aria-invalid={!!errors.description}
          rows={4}
          className={inputClass(!!errors.description)}
        />
      </Field>

      <Field label="GitHub URL" htmlFor="edit-githubUrl" error={errors.githubUrl?.message}>
        <input
          id="edit-githubUrl"
          type="url"
          {...register("githubUrl")}
          aria-invalid={!!errors.githubUrl}
          className={inputClass(!!errors.githubUrl)}
        />
      </Field>

      <Field label="Live URL" htmlFor="edit-liveUrl" error={errors.liveUrl?.message}>
        <input
          id="edit-liveUrl"
          type="url"
          {...register("liveUrl")}
          aria-invalid={!!errors.liveUrl}
          className={inputClass(!!errors.liveUrl)}
        />
      </Field>

      <div className="space-y-3">
        <label htmlFor="edit-projectImage" className="block text-sm font-medium text-[var(--noir-fg-muted)]">
          Project Image
        </label>
        <input
          id="edit-projectImage"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full text-sm text-[var(--noir-fg-muted)]"
        />
        {preview && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[var(--noir-border-strong)]">
            <Image src={getImageUrl(preview)} alt="Project preview" fill sizes="400px" unoptimized className="object-cover" />
          </div>
        )}
      </div>

      <Field label="Technologies" htmlFor="edit-technologies" error={errors.technologies?.message} hint="Comma-separated, e.g. React, Spring Boot, PostgreSQL">
        <input
          id="edit-technologies"
          type="text"
          {...register("technologies")}
          className={inputClass(!!errors.technologies)}
        />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setValue("featured", e.target.checked)}
        />
        Featured
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setValue("published", e.target.checked)}
        />
        Published
        <span className="text-xs text-[var(--noir-fg-muted)]">
          (uncheck to unpublish as a draft; preview stays available at{" "}
          <a
            href={`/projects/${project.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted"
          >
            /projects/{project.id}
          </a>
          )
        </span>
      </label>

      {/* Case-study narrative — optional, powers /projects/{id} */}
      <details className="rounded-lg border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-2)]/50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--noir-fg)]">
          Case Study (optional)
        </summary>
        <div className="mt-3 space-y-3">
          <Field label="The Problem" htmlFor="edit-problemStatement" error={errors.problemStatement?.message}>
            <textarea
              id="edit-problemStatement"
              placeholder="What pain did this project solve?"
              {...register("problemStatement")}
              className={inputClass(!!errors.problemStatement)}
              rows={3}
            />
          </Field>
          <Field label="The Solution" htmlFor="edit-solution" error={errors.solution?.message}>
            <textarea
              id="edit-solution"
              placeholder="How did you solve it?"
              {...register("solution")}
              className={inputClass(!!errors.solution)}
              rows={3}
            />
          </Field>
          <Field label="Architecture" htmlFor="edit-architecture" error={errors.architecture?.message}>
            <textarea
              id="edit-architecture"
              placeholder="Stack decisions, data flow, infrastructure"
              {...register("architecture")}
              className={inputClass(!!errors.architecture)}
              rows={3}
            />
          </Field>
          <Field label="Challenges" htmlFor="edit-challenges" error={errors.challenges?.message}>
            <textarea
              id="edit-challenges"
              placeholder="The hard parts and how you got through them"
              {...register("challenges")}
              className={inputClass(!!errors.challenges)}
              rows={3}
            />
          </Field>
          <Field label="Learnings" htmlFor="edit-learnings" error={errors.learnings?.message}>
            <textarea
              id="edit-learnings"
              placeholder="What you'd do differently"
              {...register("learnings")}
              className={inputClass(!!errors.learnings)}
              rows={3}
            />
          </Field>
          <Field label="Metrics" htmlFor="edit-metrics" error={errors.metrics?.message}>
            <textarea
              id="edit-metrics"
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
          {uploading ? "Uploading image…" : isSubmitting ? "Saving…" : "Update Project"}
        </button>
      </div>
    </form>
  );
}
