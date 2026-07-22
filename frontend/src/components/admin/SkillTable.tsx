"use client";

import { Pencil, Trash2 } from "lucide-react";
import { deleteSkill } from "@/services/skillService";
import { Skill } from "@/types";

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
    <div className="rounded-3xl border border-slate-800 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-6">Name</th>
            <th className="text-left p-6">Category</th>
            <th className="text-left p-6">Proficiency</th>
            <th className="text-left p-6">Actions</th>
          </tr>
        </thead>

        <tbody>
          {skills.map((skill) => (
            <tr key={skill.id}>
              <td className="p-6">{skill.name}</td>

              <td className="p-6">
                {skill.category}
              </td>

              <td className="p-6">
                {skill.proficiency}%
              </td>

              <td className="p-6 flex gap-4">
                <button
                  onClick={() => onEdit(skill)}
                >
                  <Pencil
                    size={20}
                    className="text-cyan-400"
                  />
                </button>

                <button
                  onClick={() =>
                    handleDelete(skill.id)
                  }
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