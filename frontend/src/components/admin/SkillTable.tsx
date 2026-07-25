"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { deleteSkill } from "@/services/skillService";
import { Skill } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";

interface Props {
  skills: Skill[];
  onEdit: (skill: Skill) => void;
}

export default function SkillTable({
  skills,
  onEdit,
}: Props) {
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmDelete) return;

    try {
      await deleteSkill(id);

      alert("Skill deleted");

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--noir-border)] overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
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
              className="transition-colors hover:bg-[var(--noir-bg-surface-2)]/60"
            >
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
                    handleDelete(skill.id)
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