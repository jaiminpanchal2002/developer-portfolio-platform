"use client";

import { Pencil, Trash2 } from "lucide-react";
import { deleteExperience } from "@/services/experienceService";
import { Experience } from "@/types";

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
    <div className="rounded-3xl border border-slate-800 overflow-x-auto">
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

        <tbody>
          {experiences.map((exp) => (
            <tr key={exp.id}>
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
                <button
                  onClick={() => onEdit(exp)}
                >
                  <Pencil
                    size={20}
                    className="text-cyan-400"
                  />
                </button>

                <button
                  onClick={() =>
                    handleDelete(exp.id)
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