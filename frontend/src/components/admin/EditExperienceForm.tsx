"use client";

import { useState } from "react";
import { updateExperience } from "@/services/experienceService";
import { Experience } from "@/types";

interface Props {
  experience: Experience;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditExperienceForm({
  experience,
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    company: experience.company || "",
    position: experience.position || "",
    description: experience.description || "",
    startDate: experience.startDate || "",
    endDate: experience.endDate || "",
    currentlyWorking: experience.currentlyWorking || false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckbox = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      currentlyWorking: e.target.checked,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await updateExperience(
        experience.id,
        formData
      );

      alert("Experience Updated");

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
        name="company"
        value={formData.company}
        onChange={handleChange}
        placeholder="Company"
        className="w-full p-3 rounded bg-slate-800"
      />

      <input
        type="text"
        name="position"
        value={formData.position}
        onChange={handleChange}
        placeholder="Position"
        className="w-full p-3 rounded bg-slate-800"
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        rows={4}
        className="w-full p-3 rounded bg-slate-800"
      />

      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        className="w-full p-3 rounded bg-slate-800"
      />

      <input
        type="date"
        name="endDate"
        value={formData.endDate || ""}
        onChange={handleChange}
        className="w-full p-3 rounded bg-slate-800"
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.currentlyWorking}
          onChange={handleCheckbox}
        />
        Currently Working
      </label>

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
          Update Experience
        </button>
      </div>
    </form>
  );
}