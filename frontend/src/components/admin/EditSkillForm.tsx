"use client";

import { useState } from "react";
import { updateSkill } from "@/services/skillService";
import { Skill } from "@/types";

interface Props {
  skill: Skill;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSkillForm({
  skill,
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "proficiency"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await updateSkill(
        skill.id,
        formData
      );

      alert("Skill Updated");

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
      />

      <input
        type="text"
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
      />

      <input
        type="number"
        name="proficiency"
        value={formData.proficiency}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 bg-gray-600 rounded-lg"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-5 py-2 bg-cyan-500 text-black rounded-lg font-semibold"
        >
          Update Skill
        </button>
      </div>
    </form>
  );
}