import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useApp } from '../contexts/AppContext';
import { Plus, CheckSquare, Trash2, Edit2, X, AlertCircle, Filter } from 'lucide-react';

const Tasks = () => {
  const { data, createTask, modifyTask, removeTask, getMemberTaskCount, getTeamMembers } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterProject, setFilterProject] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedMemberId: '',
    priority: 'Medium',
    status: 'Pending'
  });

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData(task);
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        projectId: '',
        assignedMemberId: '',
        priority: 'Medium',
        status: 'Pending'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      modifyTask(editingTask.id, formData);
    } else {
      createTask(formData);
    }
    closeModal();
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      removeTask(taskId);
    }
  };

  const getProjectName = (projectId) => {
    const project = data.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  const getMemberName = (memberId, projectId) => {
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return 'Unassigned';
    const team = data.teams.find(t => t.id === project.teamId);
    if (!team) return 'Unassigned';
    const member = team.members.find(m => m.id === memberId);
    return member ? member.name : 'Unassigned';
  };

  const selectedProject = data.projects.find(p => p.id === parseInt(formData.projectId));
  const teamMembers = selectedProject ? getTeamMembers(selectedProject.teamId) : [];

  const filteredTasks = data.tasks.filter(task => {
    if (filterProject && task.projectId !== parseInt(filterProject)) return false;
    if (filterMember && task.assignedMemberId !== parseInt(filterMember)) return false;
    return true;
  });

  const allMembers = data.teams.flatMap(team => team.members);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-destructive bg-destructive/10';
      case 'Medium': return 'text-warning bg-warning/10';
      case 'Low': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'text-success bg-success/10';
      case 'In Progress': return 'text-primary bg-primary/10';
      case 'Pending': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage and track all tasks</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Task</span>
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter size={20} className="text-muted-foreground" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Project</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">All Projects</option>
                {data.projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Member</label>
              <select
                value={filterMember}
                onChange={(e) => setFilterMember(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">All Members</option>
                {allMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Project: </span>
                      <span className="font-medium">{getProjectName(task.projectId)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Assigned to: </span>
                      <span className="font-medium">{getMemberName(task.assignedMemberId, task.projectId)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openModal(task)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Edit2 size={18} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} className="text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tasks found. Create your first task!</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-secondary rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Task Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project</label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: parseInt(e.target.value), assignedMemberId: '' })}
                      className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    >
                      <option value="">Select a project</option>
                      {data.projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Assigned Member</label>
                    <select
                      value={formData.assignedMemberId}
                      onChange={(e) => setFormData({ ...formData, assignedMemberId: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                      disabled={!formData.projectId}
                    >
                      <option value="">Select a member</option>
                      {teamMembers.map(member => {
                        const currentTasks = getMemberTaskCount(member.id);
                        const isOverloaded = currentTasks >= member.capacity;
                        return (
                          <option key={member.id} value={member.id}>
                            {member.name} ({currentTasks}/{member.capacity})
                            {isOverloaded ? ' ⚠️ Over capacity' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {formData.assignedMemberId && (() => {
                  const member = teamMembers.find(m => m.id === parseInt(formData.assignedMemberId));
                  if (member) {
                    const currentTasks = getMemberTaskCount(member.id);
                    if (currentTasks >= member.capacity) {
                      return (
                        <div className="bg-warning/10 border border-warning rounded-lg p-4 flex items-start space-x-3">
                          <AlertCircle className="text-warning flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="text-sm font-medium text-warning">Capacity Warning</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {member.name} has {currentTasks} tasks but capacity is {member.capacity}. Assign anyway?
                            </p>
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
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
                    {editingTask ? 'Update' : 'Create'}
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

export default Tasks;
