"use client";

import { useState } from "react";
import { createProject } from "@/services/projectService";

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
    featured: false,
    problemStatement: "",
    solution: "",
    architecture: "",
    challenges: "",
    learnings: "",
    metrics: "",
  });

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
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
        rows={4}
        required
      />

      <input
        type="text"
        name="technologies"
        placeholder="React, Spring Boot, PostgreSQL"
        value={formData.technologies}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
      />

      <input
        type="text"
        name="githubUrl"
        placeholder="GitHub URL"
        value={formData.githubUrl}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
      />

      <input
        type="text"
        name="liveUrl"
        placeholder="Live URL"
        value={formData.liveUrl}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.featured}
          onChange={handleCheckbox}
        />
        Featured Project
      </label>

      {/* Case-study narrative — optional, powers /projects/{id} */}
      <details className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-slate-300">
          Case Study (optional)
        </summary>
        <div className="mt-3 space-y-3">
          <textarea
            name="problemStatement"
            placeholder="The Problem — what pain did this project solve?"
            value={formData.problemStatement}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            rows={3}
          />
          <textarea
            name="solution"
            placeholder="The Solution — how did you solve it?"
            value={formData.solution}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            rows={3}
          />
          <textarea
            name="architecture"
            placeholder="Architecture — stack decisions, data flow, infrastructure"
            value={formData.architecture}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            rows={3}
          />
          <textarea
            name="challenges"
            placeholder="Challenges — the hard parts and how you got through them"
            value={formData.challenges}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            rows={3}
          />
          <textarea
            name="learnings"
            placeholder="Learnings — what you'd do differently"
            value={formData.learnings}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
            rows={3}
          />
          <textarea
            name="metrics"
            placeholder={"Metrics — one per line, e.g.\n40% faster page loads\n99.9% uptime over 6 months"}
            value={formData.metrics}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
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
          className="px-5 py-2 rounded-lg bg-cyan-500 text-black font-semibold"
        >
          Save Project
        </button>

      </div>
    </form>
  );
}