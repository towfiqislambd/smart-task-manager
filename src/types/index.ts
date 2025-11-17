export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Done';

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
  createdBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string | null;
  priority: Priority;
  status: TaskStatus;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  taskTitle: string;
  fromMember: string;
  toMember: string;
}
