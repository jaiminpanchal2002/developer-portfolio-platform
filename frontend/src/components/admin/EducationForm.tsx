"use client";

import { useState } from "react";
import { createEducation } from "@/services/educationService";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function EducationForm({
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startYear: 2020,
    endYear: 2024,
    grade: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "startYear" ||
        name === "endYear"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await createEducation(formData);

      alert("Education Added");

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        name="institution"
        placeholder="Institution"
        value={formData.institution}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
      />

      <input
        name="degree"
        placeholder="Degree"
        value={formData.degree}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
      />

      <input
        name="fieldOfStudy"
        placeholder="Field Of Study"
        value={formData.fieldOfStudy}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
      />

      <input
        type="number"
        name="startYear"
        placeholder="Start Year"
        value={formData.startYear}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
      />

      <input
        type="number"
        name="endYear"
        placeholder="End Year"
        value={formData.endYear}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
      />

      <input
        name="grade"
        placeholder="Grade / CGPA"
        value={formData.grade}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="bg-[var(--noir-bg-surface-3)] px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="bg-[var(--noir-accent)] text-[var(--noir-bg)] px-4 py-2 rounded"
        >
          Save Education
        </button>
      </div>
    </form>
  );
}