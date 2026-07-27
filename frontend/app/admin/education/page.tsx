"use client";

import { useEffect, useState } from "react";

import EducationTable from "@/components/admin/EducationTable";
import EducationForm from "@/components/admin/EducationForm";
import EditEducationForm from "@/components/admin/EditEducationForm";
import AnimatedModal from "@/components/admin/AnimatedModal";
import { stickyHeaderClass } from "@/components/admin/form/formStyles";

import { getEducations } from "@/services/educationService";
import { Education } from "@/types";

export default function EducationPage() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedEducation, setSelectedEducation] =
    useState<Education | null>(null);

  const fetchEducations = async () => {
    try {
      const data = await getEducations();
      setEducations(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getEducations();
        if (!cancelled) setEducations(data);
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = (education: Education) => {
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

          <p className="text-[var(--noir-fg-muted)]">
            Manage education details
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--noir-accent)] text-[var(--noir-bg)] px-6 py-3 rounded-xl font-semibold"
        >
          + Add Education
        </button>
      </div>

      <EducationTable
        educations={educations}
        onEdit={handleEdit}
        onRefresh={fetchEducations}
      />

      {/* Add Modal */}
      <AnimatedModal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <h2 className={stickyHeaderClass}>
          Add Education
        </h2>

        <EducationForm
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchEducations}
        />
      </AnimatedModal>

      {/* Edit Modal */}
      <AnimatedModal isOpen={showEditModal && !!selectedEducation} onClose={() => setShowEditModal(false)}>
        {selectedEducation && (
          <>
            <h2 className={stickyHeaderClass}>
              Edit Education
            </h2>

            <EditEducationForm
              education={selectedEducation}
              onClose={() => setShowEditModal(false)}
              onSuccess={fetchEducations}
            />
          </>
        )}
      </AnimatedModal>
    </div>
  );
}