export const staticData = {
  users: [
    { id: 1, email: 'admin@taskmanager.com', password: 'admin123', name: 'Admin User' },
    { id: 2, email: 'user@taskmanager.com', password: 'user123', name: 'Regular User' }
  ],
  teams: [
    {
      id: 1,
      name: 'Development Team',
      members: [
        { id: 1, name: 'Riya Sharma', role: 'Frontend Developer', capacity: 3 },
        { id: 2, name: 'Farhan Khan', role: 'Backend Developer', capacity: 4 },
        { id: 3, name: 'Priya Patel', role: 'UI/UX Designer', capacity: 5 }
      ]
    },
    {
      id: 2,
      name: 'Marketing Team',
      members: [
        { id: 4, name: 'Arjun Reddy', role: 'Content Writer', capacity: 4 },
        { id: 5, name: 'Sneha Gupta', role: 'Social Media Manager', capacity: 3 }
      ]
    }
  ],
  projects: [
    { id: 1, name: 'Website Redesign', teamId: 1, description: 'Redesigning the company website' },
    { id: 2, name: 'Mobile App Development', teamId: 1, description: 'Building a new mobile application' },
    { id: 3, name: 'Q4 Marketing Campaign', teamId: 2, description: 'Planning Q4 marketing activities' }
  ],
  tasks: [
    {
      id: 1,
      title: 'Design Homepage Mockup',
      description: 'Create initial mockup for homepage redesign',
      projectId: 1,
      assignedMemberId: 3,
      priority: 'High',
      status: 'In Progress'
    },
    {
      id: 2,
      title: 'Implement Navigation Component',
      description: 'Build responsive navigation with animations',
      projectId: 1,
      assignedMemberId: 1,
      priority: 'High',
      status: 'Pending'
    },
    {
      id: 3,
      title: 'API Integration',
      description: 'Integrate backend APIs with frontend',
      projectId: 1,
      assignedMemberId: 2,
      priority: 'Medium',
      status: 'Pending'
    },
    {
      id: 4,
      title: 'User Authentication Flow',
      description: 'Implement login and signup functionality',
      projectId: 2,
      assignedMemberId: 2,
      priority: 'High',
      status: 'In Progress'
    },
    {
      id: 5,
      title: 'Database Schema Design',
      description: 'Design database structure for mobile app',
      projectId: 2,
      assignedMemberId: 2,
      priority: 'Medium',
      status: 'Done'
    },
    {
      id: 6,
      title: 'Create Social Media Posts',
      description: 'Design and schedule social media content',
      projectId: 3,
      assignedMemberId: 5,
      priority: 'Medium',
      status: 'Pending'
    },
    {
      id: 7,
      title: 'Write Blog Articles',
      description: 'Write 3 SEO-optimized blog articles',
      projectId: 3,
      assignedMemberId: 4,
      priority: 'Low',
      status: 'Pending'
    },
    {
      id: 8,
      title: 'Design Hero Section',
      description: 'Create eye-catching hero section',
      projectId: 1,
      assignedMemberId: 1,
      priority: 'Medium',
      status: 'Pending'
    },
    {
      id: 9,
      title: 'Footer Component',
      description: 'Build footer with links and contact info',
      projectId: 1,
      assignedMemberId: 1,
      priority: 'Low',
      status: 'Pending'
    }
  ],
  activityLog: [
    {
      id: 1,
      timestamp: new Date('2024-01-15T10:30:00'),
      action: 'Task "UI Design" reassigned from Riya to Farhan',
      taskId: 1,
      fromMemberId: 1,
      toMemberId: 2
    },
    {
      id: 2,
      timestamp: new Date('2024-01-15T09:15:00'),
      action: 'Task "API Testing" reassigned from Riya to Priya',
      taskId: 3,
      fromMemberId: 1,
      toMemberId: 3
    }
  ]
};

// Helper functions to manage data
let currentData = JSON.parse(JSON.stringify(staticData));

export const resetData = () => {
  currentData = JSON.parse(JSON.stringify(staticData));
};

export const getData = () => currentData;

export const addUser = (user) => {
  const newUser = { ...user, id: Date.now() };
  currentData.users.push(newUser);
  return newUser;
};

export const addTeam = (team) => {
  const newTeam = { ...team, id: Date.now() };
  currentData.teams.push(newTeam);
  return newTeam;
};

export const updateTeam = (teamId, updates) => {
  const index = currentData.teams.findIndex(t => t.id === teamId);
  if (index !== -1) {
    currentData.teams[index] = { ...currentData.teams[index], ...updates };
    return currentData.teams[index];
  }
  return null;
};

export const deleteTeam = (teamId) => {
  currentData.teams = currentData.teams.filter(t => t.id !== teamId);
};

export const addProject = (project) => {
  const newProject = { ...project, id: Date.now() };
  currentData.projects.push(newProject);
  return newProject;
};

export const updateProject = (projectId, updates) => {
  const index = currentData.projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    currentData.projects[index] = { ...currentData.projects[index], ...updates };
    return currentData.projects[index];
  }
  return null;
};

export const deleteProject = (projectId) => {
  currentData.projects = currentData.projects.filter(p => p.id !== projectId);
  currentData.tasks = currentData.tasks.filter(t => t.projectId !== projectId);
};

export const addTask = (task) => {
  const newTask = { ...task, id: Date.now() };
  currentData.tasks.push(newTask);
  return newTask;
};

export const updateTask = (taskId, updates) => {
  const index = currentData.tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    currentData.tasks[index] = { ...currentData.tasks[index], ...updates };
    return currentData.tasks[index];
  }
  return null;
};

export const deleteTask = (taskId) => {
  currentData.tasks = currentData.tasks.filter(t => t.id !== taskId);
};

export const addActivityLog = (log) => {
  const newLog = { ...log, id: Date.now(), timestamp: new Date() };
  currentData.activityLog.unshift(newLog);
  return newLog;
};

export const getMemberTaskCount = (memberId) => {
  return currentData.tasks.filter(t => t.assignedMemberId === memberId && t.status !== 'Done').length;
};

export const reassignTasks = () => {
  const reassignments = [];
  const teams = currentData.teams;

  teams.forEach(team => {
    team.members.forEach(member => {
      const memberTasks = currentData.tasks.filter(
        t => t.assignedMemberId === member.id && t.status !== 'Done'
      );
      
      if (memberTasks.length > member.capacity) {
        const tasksToReassign = memberTasks
          .filter(t => t.priority !== 'High')
          .sort((a, b) => {
            const priorityOrder = { 'Low': 0, 'Medium': 1 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })
          .slice(0, memberTasks.length - member.capacity);

        tasksToReassign.forEach(task => {
          const availableMember = team.members.find(m => {
            if (m.id === member.id) return false;
            const currentTasks = getMemberTaskCount(m.id);
            return currentTasks < m.capacity;
          });

          if (availableMember) {
            updateTask(task.id, { assignedMemberId: availableMember.id });
            const log = {
              action: `Task "${task.title}" reassigned from ${member.name} to ${availableMember.name}`,
              taskId: task.id,
              fromMemberId: member.id,
              toMemberId: availableMember.id
            };
            addActivityLog(log);
            reassignments.push(log);
          }
        });
      }
    });
  });

  return reassignments;
};
