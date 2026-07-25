"use client";

import { useState } from "react";
import { createSkill } from "@/services/skillService";

interface SkillFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SkillForm({
  onClose,
  onSuccess,
}: SkillFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    proficiency: 0,
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
      await createSkill(formData);

      alert("Skill Added Successfully");

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to save skill");
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
        placeholder="Skill Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
        required
      />

      <input
        type="text"
        name="category"
        placeholder="Frontend / Backend / Database"
        value={formData.category}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
        required
      />

      <input
        type="number"
        name="proficiency"
        placeholder="Proficiency (0-100)"
        value={formData.proficiency}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)] border border-[var(--noir-border-strong)]"
        min={0}
        max={100}
        required
      />

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-lg bg-[var(--noir-bg-surface-3)]"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-[var(--noir-accent)] text-[var(--noir-bg)] font-semibold"
        >
          Save Skill
        </button>
      </div>
    </form>
  );
}