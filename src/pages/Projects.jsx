import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useApp } from '../contexts/AppContext';
import { Plus, FolderKanban, Trash2, Edit2, X } from 'lucide-react';

const Projects = () => {
  const { data, createProject, modifyProject, removeProject } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', teamId: '' });

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({ name: project.name, description: project.description, teamId: project.teamId });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '', teamId: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', teamId: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      modifyProject(editingProject.id, formData);
    } else {
      createProject(formData);
    }
    closeModal();
  };

  const handleDelete = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will be deleted.')) {
      removeProject(projectId);
    }
  };

  const getTeamName = (teamId) => {
    const team = data.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your projects and teams</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.projects.map(project => {
            const projectTasks = data.tasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
            
            return (
              <div key={project.id} className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FolderKanban className="text-primary" size={24} />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(project)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Edit2 size={16} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team</span>
                    <span className="font-medium">{getTeamName(project.teamId)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tasks</span>
                    <span className="font-medium">{completedTasks} / {projectTasks.length}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {data.projects.length === 0 && (
          <div className="text-center py-12">
            <FolderKanban size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No projects yet. Create your first project!</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingProject ? 'Edit Project' : 'New Project'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-secondary rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Team</label>
                  <select
                    value={formData.teamId}
                    onChange={(e) => setFormData({ ...formData, teamId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select a team</option>
                    {data.teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    {editingProject ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Projects;
