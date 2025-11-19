import { createContext, useContext, useState, useEffect } from 'react';
import { getData, addUser, addTeam, updateTeam, deleteTeam, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, reassignTasks as reassignTasksData, addActivityLog, getMemberTaskCount } from '../data/staticData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState(getData());

  const refreshData = () => {
    setData({ ...getData() });
  };

  const login = (email, password) => {
    const user = data.users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const register = (email, password, name) => {
    const existingUser = data.users.find(u => u.email === email);
    if (existingUser) {
      return { success: false, message: 'User already exists' };
    }
    const newUser = addUser({ email, password, name });
    refreshData();
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const createTeam = (team) => {
    const newTeam = addTeam(team);
    refreshData();
    return newTeam;
  };

  const modifyTeam = (teamId, updates) => {
    updateTeam(teamId, updates);
    refreshData();
  };

  const removeTeam = (teamId) => {
    deleteTeam(teamId);
    refreshData();
  };

  const createProject = (project) => {
    const newProject = addProject(project);
    refreshData();
    return newProject;
  };

  const modifyProject = (projectId, updates) => {
    updateProject(projectId, updates);
    refreshData();
  };

  const removeProject = (projectId) => {
    deleteProject(projectId);
    refreshData();
  };

  const createTask = (task) => {
    const newTask = addTask(task);
    refreshData();
    return newTask;
  };

  const modifyTask = (taskId, updates) => {
    updateTask(taskId, updates);
    refreshData();
  };

  const removeTask = (taskId) => {
    deleteTask(taskId);
    refreshData();
  };

  const handleReassignTasks = () => {
    const reassignments = reassignTasksData();
    refreshData();
    return reassignments;
  };

  const getTeamMembers = (teamId) => {
    const team = data.teams.find(t => t.id === teamId);
    return team ? team.members : [];
  };

  const getMemberById = (memberId, teamId) => {
    const team = data.teams.find(t => t.id === teamId);
    if (!team) return null;
    return team.members.find(m => m.id === memberId);
  };

  const value = {
    currentUser,
    data,
    login,
    register,
    logout,
    createTeam,
    modifyTeam,
    removeTeam,
    createProject,
    modifyProject,
    removeProject,
    createTask,
    modifyTask,
    removeTask,
    handleReassignTasks,
    getTeamMembers,
    getMemberById,
    getMemberTaskCount,
    refreshData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
