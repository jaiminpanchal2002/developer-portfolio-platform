"use client";

import { useState } from "react";
import Image from "next/image";
import { createProject } from "@/services/projectService";
import { uploadImage } from "@/services/uploadService";
import { getImageUrl } from "@/lib/api";

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectForm({
  onClose,
  onSuccess,
}: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    imageUrl: "",
    featured: false,
    published: true,
    problemStatement: "",
    solution: "",
    architecture: "",
    challenges: "",
    learnings: "",
    metrics: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      featured: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createProject(formData);

      alert("Project Added Successfully");

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to save project");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        type="text"
        name="title"
        placeholder="Project Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
        rows={4}
        required
      />

      <input
        type="text"
        name="technologies"
        placeholder="React, Spring Boot, PostgreSQL"
        value={formData.technologies}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
      />

      <input
        type="text"
        name="githubUrl"
        placeholder="GitHub URL"
        value={formData.githubUrl}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
      />

      <input
        type="text"
        name="liveUrl"
        placeholder="Live URL"
        value={formData.liveUrl}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
      />

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-[var(--noir-fg-muted)]">
          Project Image
        </label>
        <input
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

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.featured}
          onChange={handleCheckbox}
        />
        Featured Project
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.published}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, published: e.target.checked }))
          }
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
          <textarea
            name="problemStatement"
            placeholder="The Problem — what pain did this project solve?"
            value={formData.problemStatement}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
            rows={3}
          />
          <textarea
            name="solution"
            placeholder="The Solution — how did you solve it?"
            value={formData.solution}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
            rows={3}
          />
          <textarea
            name="architecture"
            placeholder="Architecture — stack decisions, data flow, infrastructure"
            value={formData.architecture}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
            rows={3}
          />
          <textarea
            name="challenges"
            placeholder="Challenges — the hard parts and how you got through them"
            value={formData.challenges}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
            rows={3}
          />
          <textarea
            name="learnings"
            placeholder="Learnings — what you'd do differently"
            value={formData.learnings}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
            rows={3}
          />
          <textarea
            name="metrics"
            placeholder={"Metrics — one per line, e.g.\n40% faster page loads\n99.9% uptime over 6 months"}
            value={formData.metrics}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
            rows={3}
          />
        </div>
      </details>

      <div className="flex gap-3 justify-end">

        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-gray-600"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={uploading}
          className="px-5 py-2 rounded-lg bg-[var(--noir-accent)] text-[var(--noir-bg)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading image…" : "Save Project"}
        </button>

      </div>
    </form>
  );
}