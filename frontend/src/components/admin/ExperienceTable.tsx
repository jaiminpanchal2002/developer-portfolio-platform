"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { deleteExperience } from "@/services/experienceService";
import { Experience } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";

interface Props {
  experiences: Experience[];
  onEdit: (experience: Experience) => void;
}

export default function ExperienceTable({
  experiences,
  onEdit,
}: Props) {
  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Delete this experience?"
      )
    )
      return;

    try {
      await deleteExperience(id);

      alert("Deleted");

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Delete Failed");
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--noir-border)] overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
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
              className="transition-colors hover:bg-[var(--noir-bg-surface-2)]/60"
            >
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
                >
                  <Pencil
                    size={20}
                    className="text-[var(--noir-accent)]"
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    handleDelete(exp.id)
                  }
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