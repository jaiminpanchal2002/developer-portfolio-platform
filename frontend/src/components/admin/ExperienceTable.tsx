"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { bulkDeleteExperiences, deleteExperience } from "@/services/experienceService";
import { Experience } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import { useBulkSelection } from "@/lib/hooks/useBulkSelection";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SelectCheckbox from "@/components/admin/SelectCheckbox";
import { confirmBulkAction, confirmDelete, toastError, toastSuccess } from "@/lib/toast";

interface Props {
  experiences: Experience[];
  onEdit: (experience: Experience) => void;
  onRefresh: () => void;
}

export default function ExperienceTable({
  experiences,
  onEdit,
  onRefresh,
}: Props) {
  const [bulkBusy, setBulkBusy] = useState(false);
  const selection = useBulkSelection(experiences);

  const handleDelete = async (exp: Experience) => {
    const confirmed = await confirmDelete(`${exp.position} at ${exp.company}`);
    if (!confirmed) return;

    try {
      await deleteExperience(exp.id);
      toastSuccess("Experience deleted successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toastError("Failed to delete experience");
    }
  };

  const handleBulkDelete = async () => {
    const ids = selection.selectedIdsArray as number[];
    const confirmed = await confirmBulkAction("Delete", ids.length, true);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteExperiences(ids);
      toastSuccess(`Deleted ${ids.length} experience${ids.length === 1 ? "" : "s"}`);
      selection.clear();
      onRefresh();
    } catch (error) {
      console.error(error);
      toastError("Bulk delete failed");
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
          { label: "Delete", icon: <Trash2 size={16} />, danger: true, onClick: handleBulkDelete },
        ]}
      />

      <div className="rounded-3xl border border-[var(--noir-border)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-10">
                <SelectCheckbox
                  checked={selection.allSelected}
                  indeterminate={selection.someSelected}
                  onChange={selection.toggleAll}
                  label="Select all experiences"
                />
              </th>
              <th className="p-6 text-left">
                Company
              </th>
              <th className="p-6 text-left">
                Position
              </th>
              <th className="p-6 text-left">
                Current
              </th>
              <th className="p-6 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
            {experiences.map((exp) => (
              <motion.tr
                key={exp.id}
                variants={staggerItem}
                className={`transition-colors hover:bg-[var(--noir-bg-surface-2)]/60 ${
                  selection.isSelected(exp.id) ? "bg-[var(--noir-accent-soft)]" : ""
                }`}
              >
                <td>
                  <SelectCheckbox
                    checked={selection.isSelected(exp.id)}
                    onChange={() => selection.toggle(exp.id)}
                    label={`Select ${exp.position} at ${exp.company}`}
                  />
                </td>

                <td className="p-6">
                  {exp.company}
                </td>

                <td className="p-6">
                  {exp.position}
                </td>

                <td className="p-6">
                  {exp.currentlyWorking
                    ? "Yes"
                    : "No"}
                </td>

                <td className="p-6 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(exp)}
                    aria-label={`Edit ${exp.position} at ${exp.company}`}
                  >
                    <Pencil
                      size={20}
                      className="text-[var(--noir-accent)]"
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(exp)}
                    aria-label={`Delete ${exp.position} at ${exp.company}`}
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
