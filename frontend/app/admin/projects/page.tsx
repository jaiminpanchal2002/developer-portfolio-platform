"use client";

import { useEffect, useState } from "react";
import ProjectTable from "@/components/admin/ProjectTable";
import ProjectForm from "@/components/admin/ProjectForm";
import EditProjectForm from "@/components/admin/EditProjectForm";
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

          <p className="text-gray-400">
            Manage portfolio projects
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-semibold"
        >
          + Add Project
        </button>
      </div>

      <ProjectTable
        projects={projects}
        onEdit={handleEdit}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Add Project
            </h2>

            <ProjectForm
              onClose={() => setShowModal(false)}
              onSuccess={fetchProjects}
            />
          </div>
        </div>
      )}

      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Edit Project
            </h2>

            <EditProjectForm
              project={selectedProject}
              onClose={() =>
                setShowEditModal(false)
              }
              onSuccess={fetchProjects}
            />
          </div>
        </div>
      )}
    </div>
  );
}