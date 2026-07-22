"use client";

import { Pencil, Trash2 } from "lucide-react";
import { deleteProject } from "@/services/projectService";
import { Project } from "@/types";

interface Props {
  projects: Project[];
  onEdit: (project: Project) => void;
}

export default function ProjectTable({
  projects,
  onEdit,
}: Props) {
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      await deleteProject(id);

      alert("Project deleted");

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-6">Title</th>
            <th className="text-left p-6">Technology</th>
            <th className="text-left p-6">Featured</th>
            <th className="text-left p-6">Actions</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td className="p-6">{project.title}</td>

              <td className="p-6">
                {project.technologies}
              </td>

              <td className="p-6">
                {project.featured ? "Yes" : "No"}
              </td>

              <td className="p-6 flex gap-4">
                <button
                  onClick={() => onEdit(project)}
                >
                  <Pencil
                    size={20}
                    className="text-cyan-400"
                  />
                </button>

                <button
                  onClick={() => handleDelete(project.id)}
                >
                  <Trash2
                    size={20}
                    className="text-red-500"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}