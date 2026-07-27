"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Archive, ArchiveRestore, CheckCircle2, GripVertical, Pencil, Trash2, XCircle } from "lucide-react";
import {
  bulkArchiveProjects,
  bulkDeleteProjects,
  bulkPublishProjects,
  bulkUnarchiveProjects,
  bulkUnpublishProjects,
  deleteProject,
  updateProject,
} from "@/services/projectService";
import { Project } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import { useBulkSelection } from "@/lib/hooks/useBulkSelection";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SelectCheckbox from "@/components/admin/SelectCheckbox";
import { confirmBulkAction, confirmDelete, toastError, toastSuccess } from "@/lib/toast";

interface Props {
  projects: Project[];
  onEdit: (project: Project) => void;
  onRefresh: () => void;
}

export default function ProjectTable({
  projects,
  onEdit,
  onRefresh,
}: Props) {
  // Local copy so drag reordering is instant; kept in sync with the prop.
  const [rows, setRows] = useState<Project[]>(projects);
  const [prevProjects, setPrevProjects] = useState(projects);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const selection = useBulkSelection(rows);

  // Sync the local ordering copy when the parent passes a new list —
  // the render-time state adjustment pattern, not an effect.
  if (prevProjects !== projects) {
    setPrevProjects(projects);
    setRows(projects);
  }

  const handleDelete = async (project: Project) => {
    const confirmed = await confirmDelete(project.title);
    if (!confirmed) return;

    try {
      await deleteProject(project.id);
      toastSuccess("Project deleted successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toastError("Failed to delete project");
    }
  };

  const handleToggleArchive = async (project: Project) => {
    try {
      if (project.archived) {
        await bulkUnarchiveProjects([project.id]);
        toastSuccess("Project unarchived successfully");
      } else {
        await bulkArchiveProjects([project.id]);
        toastSuccess("Project archived successfully");
      }
      onRefresh();
    } catch (error) {
      console.error(error);
      toastError("Failed to update archive state");
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
      toastError("Could not save the new order");
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

  const runBulk = async (
    label: string,
    action: (ids: number[]) => Promise<unknown>,
    danger = false
  ) => {
    const ids = selection.selectedIdsArray as number[];
    const confirmed = await confirmBulkAction(label, ids.length, danger);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await action(ids);
      toastSuccess(`${label} completed for ${ids.length} project${ids.length === 1 ? "" : "s"}`);
      selection.clear();
      onRefresh();
    } catch (error) {
      console.error(error);
      toastError(`Bulk ${label.toLowerCase()} failed`);
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div>
      <BulkActionBar
        count={selection.count}
        onClear={selection.clear}
        busy={bulkBusy}
        actions={[
          {
            label: "Publish",
            icon: <CheckCircle2 size={16} />,
            onClick: () => runBulk("Publish", (ids) => bulkPublishProjects(ids)),
          },
          {
            label: "Unpublish",
            icon: <XCircle size={16} />,
            onClick: () => runBulk("Unpublish", (ids) => bulkUnpublishProjects(ids)),
          },
          {
            label: "Archive",
            icon: <Archive size={16} />,
            onClick: () => runBulk("Archive", (ids) => bulkArchiveProjects(ids)),
          },
          {
            label: "Unarchive",
            icon: <ArchiveRestore size={16} />,
            onClick: () => runBulk("Unarchive", (ids) => bulkUnarchiveProjects(ids)),
          },
          {
            label: "Delete",
            icon: <Trash2 size={16} />,
            danger: true,
            onClick: () => runBulk("Delete", (ids) => bulkDeleteProjects(ids), true),
          },
        ]}
      />

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
              <th className="w-10">
                <SelectCheckbox
                  checked={selection.allSelected}
                  indeterminate={selection.someSelected}
                  onChange={selection.toggleAll}
                  label="Select all projects"
                />
              </th>
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
                      : selection.isSelected(project.id)
                        ? "bg-[var(--noir-accent-soft)]"
                        : ""
                }`}
              >
                <td className="p-6 cursor-grab active:cursor-grabbing" title="Drag to reorder">
                  <GripVertical size={18} className="text-[var(--noir-fg-subtle)]" />
                </td>

                <td>
                  <SelectCheckbox
                    checked={selection.isSelected(project.id)}
                    onChange={() => selection.toggle(project.id)}
                    label={`Select ${project.title}`}
                  />
                </td>

                <td className="p-6">{project.title}</td>

                <td className="p-6">
                  {project.technologies}
                </td>

                <td className="p-6">
                  {project.featured ? "Yes" : "No"}
                </td>

                <td className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
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
                    {project.archived && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--noir-border-strong)] bg-[var(--noir-bg-surface-3)] px-3 py-1 text-xs font-semibold text-[var(--noir-fg-muted)]">
                        <Archive size={11} /> Archived
                      </span>
                    )}
                  </div>
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
                    onClick={() => handleToggleArchive(project)}
                    aria-label={project.archived ? `Unarchive ${project.title}` : `Archive ${project.title}`}
                    title={project.archived ? "Unarchive" : "Archive"}
                  >
                    {project.archived ? (
                      <ArchiveRestore size={20} className="text-[var(--noir-fg-muted)]" />
                    ) : (
                      <Archive size={20} className="text-[var(--noir-fg-muted)]" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(project)}
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
    </div>
  );
}
