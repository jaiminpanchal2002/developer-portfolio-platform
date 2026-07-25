"use client";

import { useEffect, useState } from "react";

import CertificateTable from "@/components/admin/CertificateTable";
import CertificateForm from "@/components/admin/CertificateForm";
import EditCertificateForm from "@/components/admin/EditCertificateForm";
import AnimatedModal from "@/components/admin/AnimatedModal";

import { getCertificates } from "@/services/certificateService";
import { Certificate } from "@/types";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  const fetchCertificates = async () => {
    try {
      const data = await getCertificates();
      setCertificates(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getCertificates();
        if (!cancelled) setCertificates(data);
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">
            Certificates
          </h1>

          <p className="text-[var(--noir-fg-muted)]">
            Manage certificates
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--noir-accent)] text-[var(--noir-bg)] px-6 py-3 rounded-xl font-semibold"
        >
          + Add Certificate
        </button>
      </div>

      <CertificateTable
        certificates={certificates}
        onEdit={handleEdit}
      />

      {/* Add Modal */}
      <AnimatedModal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <h2 className="text-2xl font-bold mb-6">
          Add Certificate
        </h2>

        <CertificateForm
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchCertificates}
        />
      </AnimatedModal>

      {/* Edit Modal */}
      <AnimatedModal isOpen={showEditModal && !!selectedCertificate} onClose={() => setShowEditModal(false)}>
        {selectedCertificate && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Edit Certificate
            </h2>

            <EditCertificateForm
              certificate={selectedCertificate}
              onClose={() => setShowEditModal(false)}
              onSuccess={fetchCertificates}
            />
          </>
        )}
      </AnimatedModal>
    </div>
  );
}