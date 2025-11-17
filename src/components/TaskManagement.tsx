import { useState, useMemo } from "react";
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Task, Priority, TaskStatus } from "../types";

export function TaskManagement() {
  const { tasks, projects, teams, addTask, updateTask, deleteTask } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterMember, setFilterMember] = useState<string>("all");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "Medium" as Priority,
    status: "Pending" as TaskStatus,
  });
  const [showWarning, setShowWarning] = useState(false);
  const [warningMember, setWarningMember] = useState<{
    name: string;
    current: number;
    capacity: number;
  } | null>(null);

  const allMembers = useMemo(() => {
    const members: Array<{ id: string; name: string; teamId: string }> = [];
    teams.forEach(team => {
      team.members.forEach(member => {
        members.push({ id: member.id, name: member.name, teamId: team.id });
      });
    });
    return members;
  }, [teams]);

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        assignedTo: task.assignedTo || "",
        priority: task.priority,
        status: task.status,
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        title: "",
        description: "",
        projectId: projects.length > 0 ? projects[0].id : "",
        assignedTo: "",
        priority: "Medium",
        status: "Pending",
      });
    }
    setShowModal(true);
    setShowWarning(false);
    setWarningMember(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setShowWarning(false);
    setWarningMember(null);
  };

  const checkMemberCapacity = (memberId: string) => {
    if (!memberId) return null;

    for (const team of teams) {
      const member = team.members.find(m => m.id === memberId);
      if (member) {
        const currentTasks = tasks.filter(
          t => t.assignedTo === memberId && t.status !== "Done"
        ).length;
        return { member, currentTasks };
      }
    }
    return null;
  };

  const handleAssignmentChange = (memberId: string) => {
    setTaskForm({ ...taskForm, assignedTo: memberId });
    setShowWarning(false);
    setWarningMember(null);

    if (memberId) {
      const capacityCheck = checkMemberCapacity(memberId);
      if (
        capacityCheck &&
        capacityCheck.currentTasks >= capacityCheck.member.capacity
      ) {
        setShowWarning(true);
        setWarningMember({
          name: capacityCheck.member.name,
          current: capacityCheck.currentTasks,
          capacity: capacityCheck.member.capacity,
        });
      }
    }
  };

  const autoAssign = () => {
    if (!taskForm.projectId) return;

    const project = projects.find(p => p.id === taskForm.projectId);
    if (!project) return;

    const team = teams.find(t => t.id === project.teamId);
    if (!team) return;

    const memberLoads = team.members.map(member => {
      const load = tasks.filter(
        t => t.assignedTo === member.id && t.status !== "Done"
      ).length;
      return { member, load };
    });

    memberLoads.sort((a, b) => a.load - b.load);

    if (memberLoads.length > 0) {
      handleAssignmentChange(memberLoads[0].member.id);
    }
  };

  const handleSubmit = () => {
    if (taskForm.title.trim() && taskForm.projectId) {
      if (editingTask) {
        updateTask({
          ...editingTask,
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          projectId: taskForm.projectId,
          assignedTo: taskForm.assignedTo || null,
          priority: taskForm.priority,
          status: taskForm.status,
        });
      } else {
        addTask({
          id: crypto.randomUUID(),
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          projectId: taskForm.projectId,
          assignedTo: taskForm.assignedTo || null,
          priority: taskForm.priority,
          status: taskForm.status,
          createdAt: new Date(),
        });
      }
      closeModal();
    }
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || "Unknown Project";
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return "Unassigned";
    return allMembers.find(m => m.id === memberId)?.name || "Unknown";
  };

  const getAvailableMembers = () => {
    if (!taskForm.projectId) return [];

    const project = projects.find(p => p.id === taskForm.projectId);
    if (!project) return [];

    const team = teams.find(t => t.id === project.teamId);
    if (!team) return [];

    return team.members.map(member => {
      const currentTasks = tasks.filter(
        t => t.assignedTo === member.id && t.status !== "Done"
      ).length;
      return { ...member, currentTasks };
    });
  };

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (filterProject !== "all") {
      filtered = filtered.filter(t => t.projectId === filterProject);
    }

    if (filterMember !== "all") {
      if (filterMember === "unassigned") {
        filtered = filtered.filter(t => !t.assignedTo);
      } else {
        filtered = filtered.filter(t => t.assignedTo === filterMember);
      }
    }

    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [tasks, filterProject, filterMember]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "Done":
        return "bg-green-50 text-green-700";
      case "In Progress":
        return "bg-blue-50 text-blue-700";
      case "Pending":
        return "bg-slate-50 text-slate-700";
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={filterMember}
            onChange={e => setFilterMember(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Members</option>
            <option value="unassigned">Unassigned</option>
            {allMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => openModal()}
            disabled={projects.length === 0}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black transition disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <CheckSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">
            Create a project first to start adding tasks
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <CheckSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No tasks found</p>
          <button
            onClick={() => openModal()}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Create your first task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-slate-800">
                      {task.title}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-slate-600 mb-3">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                      {getProjectName(task.projectId)}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                      {getMemberName(task.assignedTo)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(task)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">
                {editingTask ? "Edit Task" : "New Task"}
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
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={e =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={e =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project
                  </label>
                  <select
                    value={taskForm.projectId}
                    onChange={e => {
                      setTaskForm({
                        ...taskForm,
                        projectId: e.target.value,
                        assignedTo: "",
                      });
                      setShowWarning(false);
                      setWarningMember(null);
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={e =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as Priority,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={e =>
                      setTaskForm({
                        ...taskForm,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assigned To
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={taskForm.assignedTo}
                      onChange={e => handleAssignmentChange(e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Unassigned</option>
                      {getAvailableMembers().map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.currentTasks}/{member.capacity}
                          )
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={autoAssign}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </div>

              {showWarning && warningMember && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">
                      Capacity Warning
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {warningMember.name} has {warningMember.current} tasks but
                      capacity is {warningMember.capacity}. Assign anyway?
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!taskForm.title.trim() || !taskForm.projectId}
                  className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-black transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {editingTask ? "Update Task" : "Create Task"}
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
