"use client";

import { useState } from "react";
import { createCertificate } from "@/services/certificateService";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CertificateForm({
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    issueDate: "",
    certificateUrl: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await createCertificate(formData);

      alert("Certificate Added");

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
        name="title"
        placeholder="Certificate Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
      />

      <input
        name="issuer"
        placeholder="Issuer"
        value={formData.issuer}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
      />

      <input
        type="date"
        name="issueDate"
        value={formData.issueDate}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
      />

      <input
        name="certificateUrl"
        placeholder="Certificate URL"
        value={formData.certificateUrl}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-[var(--noir-bg-surface-2)]"
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
          className="bg-[var(--noir-accent)] text-[var(--noir-bg)] px-4 py-2 rounded"
        >
          Save Certificate
        </button>
      </div>
    </form>
  );
}