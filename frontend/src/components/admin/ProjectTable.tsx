"use client";

import { useState } from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { deleteProject, updateProject } from "@/services/projectService";
import { Project } from "@/types";

interface Props {
  projects: Project[];
  onEdit: (project: Project) => void;
}

export default function ProjectTable({
  projects,
  onEdit,
}: Props) {
  // Local copy so drag reordering is instant; kept in sync with the prop.
  const [rows, setRows] = useState<Project[]>(projects);
  const [prevProjects, setPrevProjects] = useState(projects);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  // Sync the local ordering copy when the parent passes a new list —
  // the render-time state adjustment pattern, not an effect.
  if (prevProjects !== projects) {
    setPrevProjects(projects);
    setRows(projects);
  }

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

  const persistOrder = async (ordered: Project[]) => {
    setSavingOrder(true);
    try {
      // Only write rows whose position actually changed.
      await Promise.all(
        ordered
          .map((project, index) => ({ project, index }))
          .filter(({ project, index }) => project.displayOrder !== index)
          .map(({ project, index }) =>
            updateProject(project.id, { ...project, displayOrder: index })
          )
      );
      setRows(ordered.map((p, i) => ({ ...p, displayOrder: i })));
    } catch (error) {
      console.error(error);
      alert("Could not save the new order");
      setRows(projects);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setRows(next);
    setDragIndex(null);
    setOverIndex(null);
    void persistOrder(next);
  };

  return (
    <div className="rounded-3xl border border-slate-800 overflow-x-auto">
      {savingOrder && (
        <div className="px-6 pt-4 text-xs text-cyan-400 font-semibold">
          Saving order…
        </div>
      )}
      <table className="w-full">
        <thead>
          <tr>
            <th className="w-10 p-6" aria-label="Reorder" />
            <th className="text-left p-6">Title</th>
            <th className="text-left p-6">Technology</th>
            <th className="text-left p-6">Featured</th>
            <th className="text-left p-6">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((project, index) => (
            <tr
              key={project.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(index);
              }}
              onDragLeave={() => setOverIndex(null)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={
                overIndex === index && dragIndex !== null && dragIndex !== index
                  ? "border-t-2 border-cyan-500"
                  : dragIndex === index
                    ? "opacity-40"
                    : ""
              }
            >
              <td className="p-6 cursor-grab active:cursor-grabbing" title="Drag to reorder">
                <GripVertical size={18} className="text-slate-500" />
              </td>

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
                  aria-label={`Edit ${project.title}`}
                >
                  <Pencil
                    size={20}
                    className="text-cyan-400"
                  />
                </button>

                <button
                  onClick={() => handleDelete(project.id)}
                  aria-label={`Delete ${project.title}`}
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
