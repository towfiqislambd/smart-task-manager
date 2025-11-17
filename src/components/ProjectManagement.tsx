import { useState } from "react";
import { FolderKanban, Plus, Edit2, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Project } from "../types";

export function ProjectManagement() {
  const {
    projects,
    teams,
    addProject,
    updateProject,
    deleteProject,
    currentUser,
  } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setProjectName(project.name);
      setSelectedTeamId(project.teamId);
    } else {
      setEditingProject(null);
      setProjectName("");
      setSelectedTeamId(teams.length > 0 ? teams[0].id : "");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setProjectName("");
    setSelectedTeamId("");
  };

  const handleSubmit = () => {
    if (projectName.trim() && selectedTeamId && currentUser) {
      if (editingProject) {
        updateProject({
          ...editingProject,
          name: projectName.trim(),
          teamId: selectedTeamId,
        });
      } else {
        addProject({
          id: crypto.randomUUID(),
          name: projectName.trim(),
          teamId: selectedTeamId,
          createdBy: currentUser.id,
          createdAt: new Date(),
        });
      }
      closeModal();
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || "Unknown Team";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
        </div>
        <button
          onClick={() => openModal()}
          disabled={teams.length === 0}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black transition disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <FolderKanban className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">
            Create a team first to start adding projects
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <FolderKanban className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No projects yet</p>
          <button
            onClick={() => openModal()}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                      {getTeamName(project.teamId)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(project)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">
                {editingProject ? "Edit Project" : "New Project"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={e => setSelectedTeamId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!projectName.trim() || !selectedTeamId}
                  className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-black transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {editingProject ? "Update Project" : "Create Project"}
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
