import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Team, Project, Task, ActivityLog } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  activityLogs: ActivityLog[];
}

interface AppContextType extends AppState {
  login: (email: string, name: string) => void;
  logout: () => void;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
  deleteTeam: (teamId: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addActivityLog: (log: ActivityLog) => void;
  reassignTasks: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('taskManagerState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        tasks: parsed.tasks.map((t: Task) => ({
          ...t,
          createdAt: new Date(t.createdAt),
        })),
        projects: parsed.projects.map((p: Project) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        })),
        activityLogs: parsed.activityLogs.map((l: ActivityLog) => ({
          ...l,
          timestamp: new Date(l.timestamp),
        })),
      };
    }
    return {
      currentUser: null,
      users: [],
      teams: [],
      projects: [],
      tasks: [],
      activityLogs: [],
    };
  });

  const saveState = (newState: AppState) => {
    setState(newState);
    localStorage.setItem('taskManagerState', JSON.stringify(newState));
  };

  const login = (email: string, name: string) => {
    let user = state.users.find((u) => u.email === email);
    if (!user) {
      user = { id: crypto.randomUUID(), email, name };
      saveState({ ...state, currentUser: user, users: [...state.users, user] });
    } else {
      saveState({ ...state, currentUser: user });
    }
  };

  const logout = () => {
    saveState({ ...state, currentUser: null });
  };

  const addTeam = (team: Team) => {
    saveState({ ...state, teams: [...state.teams, team] });
  };

  const updateTeam = (team: Team) => {
    saveState({
      ...state,
      teams: state.teams.map((t) => (t.id === team.id ? team : t)),
    });
  };

  const deleteTeam = (teamId: string) => {
    saveState({
      ...state,
      teams: state.teams.filter((t) => t.id !== teamId),
      projects: state.projects.filter((p) => p.teamId !== teamId),
    });
  };

  const addProject = (project: Project) => {
    saveState({ ...state, projects: [...state.projects, project] });
  };

  const updateProject = (project: Project) => {
    saveState({
      ...state,
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
    });
  };

  const deleteProject = (projectId: string) => {
    saveState({
      ...state,
      projects: state.projects.filter((p) => p.id !== projectId),
      tasks: state.tasks.filter((t) => t.projectId !== projectId),
    });
  };

  const addTask = (task: Task) => {
    saveState({ ...state, tasks: [...state.tasks, task] });
  };

  const updateTask = (task: Task) => {
    saveState({
      ...state,
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    });
  };

  const deleteTask = (taskId: string) => {
    saveState({
      ...state,
      tasks: state.tasks.filter((t) => t.id !== taskId),
    });
  };

  const addActivityLog = (log: ActivityLog) => {
    saveState({
      ...state,
      activityLogs: [log, ...state.activityLogs].slice(0, 10),
    });
  };

  const reassignTasks = () => {
    const newTasks = [...state.tasks];
    const newLogs: ActivityLog[] = [];

    state.teams.forEach((team) => {
      const teamProjects = state.projects.filter((p) => p.teamId === team.id);
      const teamProjectIds = teamProjects.map((p) => p.id);
      const teamTasks = newTasks.filter((t) => teamProjectIds.includes(t.projectId));

      const memberLoads = new Map<string, number>();
      team.members.forEach((m) => {
        const count = teamTasks.filter(
          (t) => t.assignedTo === m.id && t.status !== 'Done'
        ).length;
        memberLoads.set(m.id, count);
      });

      const overloadedMembers = team.members.filter(
        (m) => (memberLoads.get(m.id) || 0) > m.capacity
      );

      overloadedMembers.forEach((member) => {
        const memberTasks = teamTasks.filter(
          (t) => t.assignedTo === member.id && t.status !== 'Done'
        );

        const reassignableTasks = memberTasks
          .filter((t) => t.priority !== 'High')
          .sort((a, b) => {
            const priorityOrder = { Low: 0, Medium: 1, High: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          });

        const excess = (memberLoads.get(member.id) || 0) - member.capacity;

        for (let i = 0; i < Math.min(excess, reassignableTasks.length); i++) {
          const availableMembers = team.members.filter(
            (m) => (memberLoads.get(m.id) || 0) < m.capacity && m.id !== member.id
          );

          if (availableMembers.length > 0) {
            availableMembers.sort(
              (a, b) => (memberLoads.get(a.id) || 0) - (memberLoads.get(b.id) || 0)
            );
            const targetMember = availableMembers[0];

            const taskIndex = newTasks.findIndex(
              (t) => t.id === reassignableTasks[i].id
            );
            if (taskIndex !== -1) {
              newTasks[taskIndex] = {
                ...newTasks[taskIndex],
                assignedTo: targetMember.id,
              };

              memberLoads.set(member.id, (memberLoads.get(member.id) || 0) - 1);
              memberLoads.set(
                targetMember.id,
                (memberLoads.get(targetMember.id) || 0) + 1
              );

              newLogs.push({
                id: crypto.randomUUID(),
                timestamp: new Date(),
                taskTitle: reassignableTasks[i].title,
                fromMember: member.name,
                toMember: targetMember.name,
              });
            }
          }
        }
      });
    });

    saveState({
      ...state,
      tasks: newTasks,
      activityLogs: [...newLogs, ...state.activityLogs].slice(0, 10),
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        addTeam,
        updateTeam,
        deleteTeam,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        addActivityLog,
        reassignTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
