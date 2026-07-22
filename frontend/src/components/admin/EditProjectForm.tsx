"use client";

import { useState } from "react";
import { updateProject } from "@/services/projectService";
import { Project } from "@/types";

interface Props {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProjectForm({
  project,
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
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
    displayOrder: project.displayOrder,
  });

  const handleCaseStudyChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await updateProject(project.id, formData);

      alert("Project updated successfully");

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        className="w-full p-3 bg-slate-800 rounded"
        placeholder="Title"
        value={formData.title}
        onChange={(e) =>
          setFormData({
            ...formData,
            title: e.target.value,
          })
        }
      />

      <textarea
        className="w-full p-3 bg-slate-800 rounded"
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({
            ...formData,
            description: e.target.value,
          })
        }
      />

      <input
        className="w-full p-3 bg-slate-800 rounded"
        placeholder="Github URL"
        value={formData.githubUrl}
        onChange={(e) =>
          setFormData({
            ...formData,
            githubUrl: e.target.value,
          })
        }
      />

      <input
        className="w-full p-3 bg-slate-800 rounded"
        placeholder="Live URL"
        value={formData.liveUrl}
        onChange={(e) =>
          setFormData({
            ...formData,
            liveUrl: e.target.value,
          })
        }
      />

      <input
        className="w-full p-3 bg-slate-800 rounded"
        placeholder="Image URL"
        value={formData.imageUrl}
        onChange={(e) =>
          setFormData({
            ...formData,
            imageUrl: e.target.value,
          })
        }
      />

      <input
        className="w-full p-3 bg-slate-800 rounded"
        placeholder="Technologies"
        value={formData.technologies}
        onChange={(e) =>
          setFormData({
            ...formData,
            technologies: e.target.value,
          })
        }
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.featured}
          onChange={(e) =>
            setFormData({
              ...formData,
              featured: e.target.checked,
            })
          }
        />
        Featured
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
            onChange={handleCaseStudyChange}
            className="w-full p-3 bg-slate-800 rounded"
            rows={3}
          />
          <textarea
            name="solution"
            placeholder="The Solution — how did you solve it?"
            value={formData.solution}
            onChange={handleCaseStudyChange}
            className="w-full p-3 bg-slate-800 rounded"
            rows={3}
          />
          <textarea
            name="architecture"
            placeholder="Architecture — stack decisions, data flow, infrastructure"
            value={formData.architecture}
            onChange={handleCaseStudyChange}
            className="w-full p-3 bg-slate-800 rounded"
            rows={3}
          />
          <textarea
            name="challenges"
            placeholder="Challenges — the hard parts and how you got through them"
            value={formData.challenges}
            onChange={handleCaseStudyChange}
            className="w-full p-3 bg-slate-800 rounded"
            rows={3}
          />
          <textarea
            name="learnings"
            placeholder="Learnings — what you'd do differently"
            value={formData.learnings}
            onChange={handleCaseStudyChange}
            className="w-full p-3 bg-slate-800 rounded"
            rows={3}
          />
          <textarea
            name="metrics"
            placeholder={"Metrics — one per line, e.g.\n40% faster page loads\n99.9% uptime over 6 months"}
            value={formData.metrics}
            onChange={handleCaseStudyChange}
            className="w-full p-3 bg-slate-800 rounded"
            rows={3}
          />
        </div>
      </details>

      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-semibold"
        >
          Update Project
        </button>

        <button
          type="button"
          onClick={onClose}
          className="bg-red-500 px-6 py-3 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}