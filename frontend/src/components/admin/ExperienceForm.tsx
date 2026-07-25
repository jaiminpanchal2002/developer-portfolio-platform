"use client";

import { useState } from "react";
import { createExperience } from "@/services/experienceService";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExperienceForm({
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    description: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
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
      await createExperience(formData);

      alert("Experience Added");

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
        type="text"
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
        className="w-full p-3 rounded bg-[var(--noir-bg-surface-2)]"
        required
      />

      <input
        type="text"
        name="position"
        placeholder="Position"
        value={formData.position}
        onChange={handleChange}
        className="w-full p-3 rounded bg-[var(--noir-bg-surface-2)]"
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full p-3 rounded bg-[var(--noir-bg-surface-2)]"
        rows={4}
      />

      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        className="w-full p-3 rounded bg-[var(--noir-bg-surface-2)]"
      />

      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        className="w-full p-3 rounded bg-[var(--noir-bg-surface-2)]"
      />

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={formData.currentlyWorking}
          onChange={handleCheckbox}
        />
        Currently Working
      </label>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="bg-[var(--noir-accent)] text-[var(--noir-bg)] px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </form>
  );
}