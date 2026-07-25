"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { deleteEducation } from "@/services/educationService";
import { Education } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";

interface Props {
  educations: Education[];
  onEdit: (education: Education) => void;
}

export default function EducationTable({
  educations,
  onEdit,
}: Props) {
  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Delete this education?"
      )
    )
      return;

    try {
      await deleteEducation(id);

      alert("Deleted");

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--noir-border)] overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
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
              className="transition-colors hover:bg-[var(--noir-bg-surface-2)]/60"
            >
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
                    handleDelete(
                      education.id
                    )
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