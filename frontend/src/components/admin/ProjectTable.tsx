"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { deleteProject, updateProject } from "@/services/projectService";
import { Project } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";

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
    <div className="rounded-3xl border border-[var(--noir-border)] overflow-x-auto">
      {savingOrder && (
        <div className="px-6 pt-4 text-xs text-[var(--noir-accent)] font-semibold">
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
            <th className="text-left p-6">Status</th>
            <th className="text-left p-6">Actions</th>
          </tr>
        </thead>

        <motion.tbody
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {rows.map((project, index) => (
            <motion.tr
              key={project.id}
              variants={staggerItem}
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
              className={`transition-colors hover:bg-[var(--noir-bg-surface-2)]/60 ${
                overIndex === index && dragIndex !== null && dragIndex !== index
                  ? "border-t-2 border-[var(--noir-accent)]"
                  : dragIndex === index
                    ? "opacity-40"
                    : ""
              }`}
            >
              <td className="p-6 cursor-grab active:cursor-grabbing" title="Drag to reorder">
                <GripVertical size={18} className="text-[var(--noir-fg-subtle)]" />
              </td>

              <td className="p-6">{project.title}</td>

              <td className="p-6">
                {project.technologies}
              </td>

              <td className="p-6">
                {project.featured ? "Yes" : "No"}
              </td>

              <td className="p-6">
                {project.published === false ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                    Draft
                    <a
                      href={`/projects/${project.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-dotted"
                      title="Preview the draft case study"
                    >
                      Preview
                    </a>
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                    Published
                  </span>
                )}
              </td>

              <td className="p-6 flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(project)}
                  aria-label={`Edit ${project.title}`}
                >
                  <Pencil
                    size={20}
                    className="text-[var(--noir-accent)]"
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(project.id)}
                  aria-label={`Delete ${project.title}`}
                >
                  <Trash2
                    size={20}
                    className="text-red-500"
                  />
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}
