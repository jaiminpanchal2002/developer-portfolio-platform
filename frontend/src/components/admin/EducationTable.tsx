"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { bulkDeleteEducations, deleteEducation } from "@/services/educationService";
import { Education } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import { useBulkSelection } from "@/lib/hooks/useBulkSelection";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SelectCheckbox from "@/components/admin/SelectCheckbox";
import { confirmBulkAction, confirmDelete, toastError, toastSuccess } from "@/lib/toast";

interface Props {
  educations: Education[];
  onEdit: (education: Education) => void;
  onRefresh: () => void;
}

export default function EducationTable({
  educations,
  onEdit,
  onRefresh,
}: Props) {
  const [bulkBusy, setBulkBusy] = useState(false);
  const selection = useBulkSelection(educations);

  const handleDelete = async (education: Education) => {
    const confirmed = await confirmDelete(education.institution);
    if (!confirmed) return;

    try {
      await deleteEducation(education.id);
      toastSuccess("Education deleted successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toastError("Failed to delete education");
    }
  };

  const handleBulkDelete = async () => {
    const ids = selection.selectedIdsArray as number[];
    const confirmed = await confirmBulkAction("Delete", ids.length, true);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteEducations(ids);
      toastSuccess(`Deleted ${ids.length} education entr${ids.length === 1 ? "y" : "ies"}`);
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
                  label="Select all education entries"
                />
              </th>
              <th className="p-6 text-left">
                Institution
              </th>
              <th className="p-6 text-left">
                Degree
              </th>
              <th className="p-6 text-left">
                Years
              </th>
              <th className="p-6 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
            {educations.map((education) => (
              <motion.tr
                key={education.id}
                variants={staggerItem}
                className={`transition-colors hover:bg-[var(--noir-bg-surface-2)]/60 ${
                  selection.isSelected(education.id) ? "bg-[var(--noir-accent-soft)]" : ""
                }`}
              >
                <td>
                  <SelectCheckbox
                    checked={selection.isSelected(education.id)}
                    onChange={() => selection.toggle(education.id)}
                    label={`Select ${education.institution}`}
                  />
                </td>

                <td className="p-6">
                  {education.institution}
                </td>

                <td className="p-6">
                  {education.degree}
                </td>

                <td className="p-6">
                  {education.startYear} -
                  {education.endYear}
                </td>

                <td className="p-6 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      onEdit(education)
                    }
                    aria-label={`Edit ${education.institution}`}
                  >
                    <Pencil
                      size={20}
                      className="text-[var(--noir-accent)]"
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(education)}
                    aria-label={`Delete ${education.institution}`}
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
