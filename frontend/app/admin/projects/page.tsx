"use client";

import { useEffect, useState } from "react";
import ProjectTable from "@/components/admin/ProjectTable";
import ProjectForm from "@/components/admin/ProjectForm";
import EditProjectForm from "@/components/admin/EditProjectForm";
import AnimatedModal from "@/components/admin/AnimatedModal";
import { getAdminProjects } from "@/services/projectService";
import { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const fetchProjects = async () => {
    try {
      const data = await getAdminProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminProjects();
        if (!cancelled) setProjects(data);
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">
            Projects
          </h1>

          <p className="text-[var(--noir-fg-muted)]">
            Manage portfolio projects
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[var(--noir-accent)] text-[var(--noir-bg)] px-6 py-3 rounded-xl font-semibold"
        >
          + Add Project
        </button>
      </div>

      <ProjectTable
        projects={projects}
        onEdit={handleEdit}
      />

      <AnimatedModal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-2xl font-bold mb-6">
          Add Project
        </h2>

        <ProjectForm
          onClose={() => setShowModal(false)}
          onSuccess={fetchProjects}
        />
      </AnimatedModal>

      <AnimatedModal isOpen={showEditModal && !!selectedProject} onClose={() => setShowEditModal(false)}>
        {selectedProject && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Edit Project
            </h2>

            <EditProjectForm
              project={selectedProject}
              onClose={() => setShowEditModal(false)}
              onSuccess={fetchProjects}
            />
          </>
        )}
      </AnimatedModal>
    </div>
  );
}