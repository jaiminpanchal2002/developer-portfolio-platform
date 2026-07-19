"use client";

import { useEffect, useState } from "react";

import CertificateTable from "@/components/admin/CertificateTable";
import CertificateForm from "@/components/admin/CertificateForm";
import EditCertificateForm from "@/components/admin/EditCertificateForm";

import { getCertificates } from "@/services/certificateService";
import { Certificate } from "@/types";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<any>(null);

  const fetchCertificates = async () => {
    try {
      const data = await getCertificates();
      setCertificates(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleEdit = (certificate: any) => {
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

          <p className="text-gray-400">
            Manage certificates
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-semibold"
        >
          + Add Certificate
        </button>
      </div>

      <CertificateTable
        certificates={certificates}
        onEdit={handleEdit}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Add Certificate
            </h2>

            <CertificateForm
              onClose={() => setShowAddModal(false)}
              onSuccess={fetchCertificates}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Edit Certificate
            </h2>

            <EditCertificateForm
              certificate={selectedCertificate}
              onClose={() =>
                setShowEditModal(false)
              }
              onSuccess={fetchCertificates}
            />
          </div>
        </div>
      )}
    </div>
  );
}