"use client";

import { useCallback, useEffect, useState } from "react";

import SkillTable from "@/components/admin/SkillTable";
import SkillForm from "@/components/admin/SkillForm";
import EditSkillForm from "@/components/admin/EditSkillForm";

import { getSkills } from "@/services/skillService";
import { Skill } from "@/types";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const fetchSkills = useCallback(async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSkills();
        if (!cancelled) setSkills(data);
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">
            Skills
          </h1>

          <p className="text-[var(--noir-fg-muted)]">
            Manage portfolio skills
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--noir-accent)] text-[var(--noir-bg)] px-6 py-3 rounded-xl font-semibold"
        >
          + Add Skill
        </button>
      </div>

      {/* Table */}
      <SkillTable
        skills={skills}
        onEdit={handleEdit}
      />

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[var(--noir-bg)]/60 flex justify-center items-center z-50">
          <div className="bg-[var(--noir-bg-elevated)] p-6 rounded-2xl w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-6">
              Add Skill
            </h2>

            <SkillForm
              onClose={() =>
                setShowAddModal(false)
              }
              onSuccess={fetchSkills}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedSkill && (
        <div className="fixed inset-0 bg-[var(--noir-bg)]/60 flex justify-center items-center z-50">
          <div className="bg-[var(--noir-bg-elevated)] p-6 rounded-2xl w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-6">
              Edit Skill
            </h2>

            <EditSkillForm
              skill={selectedSkill}
              onClose={() =>
                setShowEditModal(false)
              }
              onSuccess={fetchSkills}
            />
          </div>
        </div>
      )}
    </div>
  );
}