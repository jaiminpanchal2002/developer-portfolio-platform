"use client";

import { useState } from "react";
import { updateEducation } from "@/services/educationService";
import { Education } from "@/types";

interface Props {
  education: Education;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEducationForm({
  education,
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    institution: education.institution || "",
    degree: education.degree || "",
    fieldOfStudy: education.fieldOfStudy || "",
    startYear: education.startYear || 2020,
    endYear: education.endYear || 2024,
    grade: education.grade || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "startYear" ||
        name === "endYear"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await updateEducation(
        education.id,
        formData
      );

      alert("Education Updated");

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        type="text"
        name="institution"
        placeholder="Institution"
        value={formData.institution}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800"
      />

      <input
        type="text"
        name="degree"
        placeholder="Degree"
        value={formData.degree}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800"
      />

      <input
        type="text"
        name="fieldOfStudy"
        placeholder="Field Of Study"
        value={formData.fieldOfStudy}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800"
      />

      <input
        type="number"
        name="startYear"
        placeholder="Start Year"
        value={formData.startYear}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800"
      />

      <input
        type="number"
        name="endYear"
        placeholder="End Year"
        value={formData.endYear}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800"
      />

      <input
        type="text"
        name="grade"
        placeholder="Grade / CGPA"
        value={formData.grade}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800"
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="bg-cyan-500 text-black px-4 py-2 rounded"
        >
          Update Education
        </button>
      </div>
    </form>
  );
}