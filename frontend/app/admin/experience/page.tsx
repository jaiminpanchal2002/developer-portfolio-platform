"use client";

import { useEffect, useState } from "react";

import ExperienceTable from "@/components/admin/ExperienceTable";
import ExperienceForm from "@/components/admin/ExperienceForm";
import EditExperienceForm from "@/components/admin/EditExperienceForm";

import { getExperiences } from "@/services/experienceService";
import { Experience } from "@/types";

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const fetchExperiences = async () => {
    try {
      const data = await getExperiences();
      setExperiences(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getExperiences();
        if (!cancelled) setExperiences(data);
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = (experience: Experience) => {
    setSelectedExperience(experience);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">
            Experience
          </h1>

          <p className="text-[var(--noir-fg-muted)]">
            Manage work experience
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--noir-accent)] text-[var(--noir-bg)] px-6 py-3 rounded-xl font-semibold"
        >
          + Add Experience
        </button>
      </div>

      <ExperienceTable
        experiences={experiences}
        onEdit={handleEdit}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[var(--noir-bg)]/60 flex justify-center items-center z-50">
          <div className="bg-[var(--noir-bg-elevated)] p-6 rounded-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Add Experience
            </h2>

            <ExperienceForm
              onClose={() => setShowAddModal(false)}
              onSuccess={fetchExperiences}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedExperience && (
        <div className="fixed inset-0 bg-[var(--noir-bg)]/60 flex justify-center items-center z-50">
          <div className="bg-[var(--noir-bg-elevated)] p-6 rounded-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Edit Experience
            </h2>

            <EditExperienceForm
              experience={selectedExperience}
              onClose={() => setShowEditModal(false)}
              onSuccess={fetchExperiences}
            />
          </div>
        </div>
      )}
    </div>
  );
}