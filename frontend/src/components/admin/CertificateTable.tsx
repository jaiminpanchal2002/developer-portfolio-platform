"use client";

import { Pencil, Trash2 } from "lucide-react";
import { deleteCertificate } from "@/services/certificateService";
import { Certificate } from "@/types";

interface Props {
  certificates: Certificate[];
  onEdit: (certificate: Certificate) => void;
}

export default function CertificateTable({
  certificates,
  onEdit,
}: Props) {
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete certificate?"))
      return;

    try {
      await deleteCertificate(id);

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
              Title
            </th>
            <th className="p-6 text-left">
              Issuer
            </th>
            <th className="p-6 text-left">
              Issue Date
            </th>
            <th className="p-6 text-left">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {certificates.map((certificate) => (
            <tr key={certificate.id}>
              <td className="p-6">
                {certificate.title}
              </td>

              <td className="p-6">
                {certificate.issuer}
              </td>

              <td className="p-6">
                {certificate.issueDate}
              </td>

              <td className="p-6 flex gap-4">
                <button
                  onClick={() =>
                    onEdit(certificate)
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
                      certificate.id
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