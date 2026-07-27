"use client";

import { useCallback, useEffect, useState } from "react";

import SkillTable from "@/components/admin/SkillTable";
import SkillForm from "@/components/admin/SkillForm";
import EditSkillForm from "@/components/admin/EditSkillForm";
import AnimatedModal from "@/components/admin/AnimatedModal";
import { stickyHeaderClass } from "@/components/admin/form/formStyles";

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
        onRefresh={fetchSkills}
      />

      {/* Add Modal */}
      <AnimatedModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        className="max-w-xl"
      >
        <h2 className={stickyHeaderClass}>
          Add Skill
        </h2>

        <SkillForm
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchSkills}
        />
      </AnimatedModal>

      {/* Edit Modal */}
      <AnimatedModal
        isOpen={showEditModal && !!selectedSkill}
        onClose={() => setShowEditModal(false)}
        className="max-w-xl"
      >
        {selectedSkill && (
          <>
            <h2 className={stickyHeaderClass}>
              Edit Skill
            </h2>

            <EditSkillForm
              skill={selectedSkill}
              onClose={() => setShowEditModal(false)}
              onSuccess={fetchSkills}
            />
          </>
        )}
      </AnimatedModal>
    </div>
  );
}