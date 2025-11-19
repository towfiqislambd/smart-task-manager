import MainLayout from '../layouts/MainLayout';
import { useApp } from '../contexts/AppContext';
import { FolderKanban, CheckSquare, Users, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { data, handleReassignTasks, getMemberTaskCount } = useApp();
  const navigate = useNavigate();

  const totalProjects = data.projects.length;
  const totalTasks = data.tasks.length;
  const totalMembers = data.teams.reduce((acc, team) => acc + team.members.length, 0);
  const activeTasks = data.tasks.filter(t => t.status !== 'Done').length;

  const recentLogs = data.activityLog.slice(0, 5);

  const onReassign = () => {
    const reassignments = handleReassignTasks();
    if (reassignments.length === 0) {
      alert('No tasks need reassignment!');
    } else {
      alert(`Successfully reassigned ${reassignments.length} task(s)!`);
    }
  };

  const stats = [
    { label: 'Total Projects', value: totalProjects, icon: FolderKanban, color: 'text-primary' },
    { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'text-primary' },
    { label: 'Team Members', value: totalMembers, icon: Users, color: 'text-primary' },
    { label: 'Active Tasks', value: activeTasks, icon: TrendingUp, color: 'text-success' }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your task management system</p>
          </div>
          <button
            onClick={onReassign}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <TrendingUp size={20} />
            <span>Reassign Tasks</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={stat.color} size={24} />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Users size={20} className="text-primary" />
              <span>Team Summary</span>
            </h2>
            <div className="space-y-4">
              {data.teams.map(team => (
                <div key={team.id} className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">{team.name}</h3>
                  {team.members.map(member => {
                    const taskCount = getMemberTaskCount(member.id);
                    const isOverloaded = taskCount > member.capacity;
                    const percentage = (taskCount / member.capacity) * 100;
                    
                    return (
                      <div key={member.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{member.name}</span>
                            {isOverloaded && (
                              <AlertCircle size={16} className="text-warning" />
                            )}
                          </div>
                          <span className={`text-sm font-semibold ${
                            isOverloaded ? 'text-warning' : 'text-success'
                          }`}>
                            {taskCount} / {member.capacity}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isOverloaded ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <TrendingUp size={20} className="text-primary" />
                <span>Recent Activity</span>
              </span>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-primary hover:underline flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight size={16} />
              </button>
            </h2>
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent activity</p>
              ) : (
                recentLogs.map(log => (
                  <div key={log.id} className="flex items-start space-x-3 pb-4 border-b border-border last:border-0">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <TrendingUp size={16} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
