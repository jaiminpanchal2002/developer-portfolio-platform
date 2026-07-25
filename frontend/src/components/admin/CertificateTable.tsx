"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { deleteCertificate } from "@/services/certificateService";
import { Certificate } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";

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
    <div className="rounded-3xl border border-[var(--noir-border)] overflow-x-auto">
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

        <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
          {certificates.map((certificate) => (
            <motion.tr
              key={certificate.id}
              variants={staggerItem}
              className="transition-colors hover:bg-[var(--noir-bg-surface-2)]/60"
            >
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
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    onEdit(certificate)
                  }
                >
                  <Pencil
                    size={20}
                    className="text-[var(--noir-accent)]"
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}