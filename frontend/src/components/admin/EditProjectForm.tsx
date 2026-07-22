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
  });

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