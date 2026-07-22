"use client";

import { Pencil, Trash2 } from "lucide-react";
import { deleteEducation } from "@/services/educationService";
import { Education } from "@/types";

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
    <div className="rounded-3xl border border-slate-800 overflow-x-auto">
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

        <tbody>
          {educations.map((education) => (
            <tr key={education.id}>
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
                <button
                  onClick={() =>
                    onEdit(education)
                  }
                >
                  <Pencil
                    size={20}
                    className="text-cyan-400"
                  />
                </button>

                <button
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
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}