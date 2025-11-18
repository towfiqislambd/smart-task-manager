import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  capacity: number;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Done';
}

export interface Project {
  id: string;
  name: string;
  teamId: string;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
  addProject: (project: Project) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  reassignTasks: () => void;
  getTeamById: (teamId: string) => Team | undefined;
  getProjectById: (projectId: string) => Project | undefined;
  getMemberTaskCount: (teamId: string, memberId: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUsers: User[] = [
  { id: '1', name: 'Demo User', email: 'demo@example.com' }
];

const initialTeams: Team[] = [
  {
    id: '1',
    name: 'Development Team',
    members: [
      { id: '1', name: 'Riya', role: 'Frontend Developer', capacity: 3 },
      { id: '2', name: 'Farhan', role: 'Backend Developer', capacity: 4 },
      { id: '3', name: 'Amit', role: 'Designer', capacity: 3 },
    ]
  }
];

const initialProjects: Project[] = [
  { id: '1', name: 'Website Redesign', teamId: '1' },
  { id: '2', name: 'Mobile App', teamId: '1' }
];

const initialTasks: Task[] = [
  { id: '1', title: 'UI Design', description: 'Create new UI designs', projectId: '1', assignedTo: '1', priority: 'High', status: 'In Progress' },
  { id: '2', title: 'API Integration', description: 'Integrate REST APIs', projectId: '1', assignedTo: '2', priority: 'Medium', status: 'Pending' },
  { id: '3', title: 'Testing', description: 'Test all features', projectId: '2', assignedTo: '1', priority: 'Low', status: 'Pending' },
  { id: '4', title: 'Database Setup', description: 'Set up database schema', projectId: '2', assignedTo: '2', priority: 'High', status: 'Done' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(initialUsers);
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (name: string, email: string, password: string): boolean => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email
    };
    setCurrentUser(newUser);
    return true;
  };

  const addTeam = (team: Team) => {
    setTeams([...teams, team]);
  };

  const updateTeam = (updatedTeam: Team) => {
    setTeams(teams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  };

  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const getMemberTaskCount = (teamId: string, memberId: string): number => {
    const teamProjects = projects.filter(p => p.teamId === teamId);
    const projectIds = teamProjects.map(p => p.id);
    return tasks.filter(t => projectIds.includes(t.projectId) && t.assignedTo === memberId && t.status !== 'Done').length;
  };

  const reassignTasks = () => {
    const newLogs: ActivityLog[] = [];
    const updatedTasks = [...tasks];

    teams.forEach(team => {
      const teamProjects = projects.filter(p => p.teamId === team.id);
      const teamProjectIds = teamProjects.map(p => p.id);
      const teamTasks = updatedTasks.filter(t => teamProjectIds.includes(t.projectId) && t.status !== 'Done');

      team.members.forEach(member => {
        const memberTasks = teamTasks.filter(t => t.assignedTo === member.id);
        const overloadCount = memberTasks.length - member.capacity;

        if (overloadCount > 0) {
          const tasksToReassign = memberTasks
            .filter(t => t.priority !== 'High')
            .sort((a, b) => a.priority === 'Low' ? -1 : 1)
            .slice(0, overloadCount);

          tasksToReassign.forEach(task => {
            // Calculate current task counts using updatedTasks instead of state
            const availableMembers = team.members
              .filter(m => {
                if (m.id === member.id) return false;
                const currentCount = updatedTasks.filter(
                  t => teamProjectIds.includes(t.projectId) && 
                       t.assignedTo === m.id && 
                       t.status !== 'Done'
                ).length;
                return currentCount < m.capacity;
              })
              .sort((a, b) => {
                const aCount = updatedTasks.filter(
                  t => teamProjectIds.includes(t.projectId) && 
                       t.assignedTo === a.id && 
                       t.status !== 'Done'
                ).length;
                const bCount = updatedTasks.filter(
                  t => teamProjectIds.includes(t.projectId) && 
                       t.assignedTo === b.id && 
                       t.status !== 'Done'
                ).length;
                return aCount - bCount;
              });

            if (availableMembers.length > 0) {
              const newAssignee = availableMembers[0];
              const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
              updatedTasks[taskIndex] = { ...task, assignedTo: newAssignee.id };

              newLogs.push({
                id: Date.now().toString() + Math.random(),
                timestamp: new Date(),
                message: `Task "${task.title}" reassigned from ${member.name} to ${newAssignee.name}`
              });
            }
          });
        }
      });
    });

    setTasks(updatedTasks);
    if (newLogs.length > 0) {
      setActivityLogs([...newLogs, ...activityLogs].slice(0, 10));
    }
  };

  const getTeamById = (teamId: string) => teams.find(t => t.id === teamId);
  const getProjectById = (projectId: string) => projects.find(p => p.id === projectId);

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      teams,
      projects,
      tasks,
      activityLogs,
      login,
      logout,
      register,
      addTeam,
      updateTeam,
      addProject,
      addTask,
      updateTask,
      deleteTask,
      reassignTasks,
      getTeamById,
      getProjectById,
      getMemberTaskCount
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
