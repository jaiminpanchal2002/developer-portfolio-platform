"use client";

import { useState } from "react";
import { updateCertificate } from "@/services/certificateService";
import { Certificate } from "@/types";

interface Props {
  certificate: Certificate;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCertificateForm({
  certificate,
  onClose,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    title: certificate.title || "",
    issuer: certificate.issuer || "",
    issueDate: certificate.issueDate || "",
    certificateUrl: certificate.certificateUrl || "",
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
      await updateCertificate(
        certificate.id,
        formData
      );

      alert("Certificate Updated");

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
        name="title"
        placeholder="Certificate Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
      />

      <input
        type="text"
        name="issuer"
        placeholder="Issuer"
        value={formData.issuer}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
      />

      <input
        type="date"
        name="issueDate"
        value={formData.issueDate}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
      />

      <input
        type="text"
        name="certificateUrl"
        placeholder="Certificate URL"
        value={formData.certificateUrl}
        onChange={handleChange}
        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
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
          Update Certificate
        </button>
      </div>
    </form>
  );
}