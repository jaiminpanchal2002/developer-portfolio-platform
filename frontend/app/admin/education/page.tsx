"use client";

import { useEffect, useState } from "react";

import EducationTable from "@/components/admin/EducationTable";
import EducationForm from "@/components/admin/EducationForm";
import EditEducationForm from "@/components/admin/EditEducationForm";

import { getEducations } from "@/services/educationService";
import { Education } from "@/types";

export default function EducationPage() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedEducation, setSelectedEducation] =
    useState<any>(null);

  const fetchEducations = async () => {
    try {
      const data = await getEducations();
      setEducations(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEducations();
  }, []);

  const handleEdit = (education: any) => {
    setSelectedEducation(education);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">
            Education
          </h1>

          <p className="text-gray-400">
            Manage education details
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-semibold"
        >
          + Add Education
        </button>
      </div>

      <EducationTable
        educations={educations}
        onEdit={handleEdit}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Add Education
            </h2>

            <EducationForm
              onClose={() => setShowAddModal(false)}
              onSuccess={fetchEducations}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEducation && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Edit Education
            </h2>

            <EditEducationForm
              education={selectedEducation}
              onClose={() =>
                setShowEditModal(false)
              }
              onSuccess={fetchEducations}
            />
          </div>
        </div>
      )}
    </div>
  );
}