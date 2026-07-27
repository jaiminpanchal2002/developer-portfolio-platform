"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { bulkDeleteCertificates, deleteCertificate } from "@/services/certificateService";
import { Certificate } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/motion/adminMotion";
import { useBulkSelection } from "@/lib/hooks/useBulkSelection";
import BulkActionBar from "@/components/admin/BulkActionBar";
import SelectCheckbox from "@/components/admin/SelectCheckbox";
import { confirmBulkAction, confirmDelete, toastError, toastSuccess } from "@/lib/toast";

interface Props {
  certificates: Certificate[];
  onEdit: (certificate: Certificate) => void;
  onRefresh: () => void;
}

export default function CertificateTable({
  certificates,
  onEdit,
  onRefresh,
}: Props) {
  const [bulkBusy, setBulkBusy] = useState(false);
  const selection = useBulkSelection(certificates);

  const handleDelete = async (certificate: Certificate) => {
    const confirmed = await confirmDelete(certificate.title);
    if (!confirmed) return;

    try {
      await deleteCertificate(certificate.id);
      toastSuccess("Certificate deleted successfully");
      onRefresh();
    } catch (error) {
      console.error(error);
      toastError("Failed to delete certificate");
    }
  };

  const handleBulkDelete = async () => {
    const ids = selection.selectedIdsArray as number[];
    const confirmed = await confirmBulkAction("Delete", ids.length, true);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteCertificates(ids);
      toastSuccess(`Deleted ${ids.length} certificate${ids.length === 1 ? "" : "s"}`);
      selection.clear();
      onRefresh();
    } catch (error) {
      console.error(error);
      toastError("Bulk delete failed");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div>
      <BulkActionBar
        count={selection.count}
        onClear={selection.clear}
        busy={bulkBusy}
        actions={[
          { label: "Delete", icon: <Trash2 size={16} />, danger: true, onClick: handleBulkDelete },
        ]}
      />

      <div className="rounded-3xl border border-[var(--noir-border)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-10">
                <SelectCheckbox
                  checked={selection.allSelected}
                  indeterminate={selection.someSelected}
                  onChange={selection.toggleAll}
                  label="Select all certificates"
                />
              </th>
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
                className={`transition-colors hover:bg-[var(--noir-bg-surface-2)]/60 ${
                  selection.isSelected(certificate.id) ? "bg-[var(--noir-accent-soft)]" : ""
                }`}
              >
                <td>
                  <SelectCheckbox
                    checked={selection.isSelected(certificate.id)}
                    onChange={() => selection.toggle(certificate.id)}
                    label={`Select ${certificate.title}`}
                  />
                </td>

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
                    aria-label={`Edit ${certificate.title}`}
                  >
                    <Pencil
                      size={20}
                      className="text-[var(--noir-accent)]"
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(certificate)}
                    aria-label={`Delete ${certificate.title}`}
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
    </div>
  );
}
