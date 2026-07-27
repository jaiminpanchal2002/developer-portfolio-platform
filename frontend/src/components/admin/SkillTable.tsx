"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { bulkDeleteSkills, deleteSkill } from "@/services/skillService";
import { Skill } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import { useBulkSelection } from "@/lib/hooks/useBulkSelection";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SelectCheckbox from "@/components/admin/SelectCheckbox";
import { confirmBulkAction, confirmDelete, toastError, toastSuccess } from "@/lib/toast";

interface Props {
  skills: Skill[];
  onEdit: (skill: Skill) => void;
  onRefresh: () => void;
}

export default function SkillTable({
  skills,
  onEdit,
  onRefresh,
}: Props) {
  const [bulkBusy, setBulkBusy] = useState(false);
  const selection = useBulkSelection(skills);

  const handleDelete = async (skill: Skill) => {
    const confirmed = await confirmDelete(skill.name);
    if (!confirmed) return;

    try {
      await deleteSkill(skill.id);
      toastSuccess("Skill deleted successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toastError("Failed to delete skill");
    }
  };

  const handleBulkDelete = async () => {
    const ids = selection.selectedIdsArray as number[];
    const confirmed = await confirmBulkAction("Delete", ids.length, true);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteSkills(ids);
      toastSuccess(`Deleted ${ids.length} skill${ids.length === 1 ? "" : "s"}`);
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
                  label="Select all skills"
                />
              </th>
              <th className="text-left p-6">Name</th>
              <th className="text-left p-6">Category</th>
              <th className="text-left p-6">Proficiency</th>
              <th className="text-left p-6">Actions</th>
            </tr>
          </thead>

          <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
            {skills.map((skill) => (
              <motion.tr
                key={skill.id}
                variants={staggerItem}
                className={`transition-colors hover:bg-[var(--noir-bg-surface-2)]/60 ${
                  selection.isSelected(skill.id) ? "bg-[var(--noir-accent-soft)]" : ""
                }`}
              >
                <td>
                  <SelectCheckbox
                    checked={selection.isSelected(skill.id)}
                    onChange={() => selection.toggle(skill.id)}
                    label={`Select ${skill.name}`}
                  />
                </td>

                <td className="p-6">{skill.name}</td>

                <td className="p-6">
                  {skill.category}
                </td>

                <td className="p-6">
                  {skill.proficiency}%
                </td>

                <td className="p-6 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(skill)}
                    aria-label={`Edit ${skill.name}`}
                  >
                    <Pencil
                      size={20}
                      className="text-[var(--noir-accent)]"
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(skill)}
                    aria-label={`Delete ${skill.name}`}
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
