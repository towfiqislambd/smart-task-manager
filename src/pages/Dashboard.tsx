import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, CheckSquare, Users, RefreshCw, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Dashboard = () => {
  const { teams, projects, tasks, activityLogs, reassignTasks, getMemberTaskCount } = useApp();

  const handleReassign = () => {
    reassignTasks();
    toast.success('Tasks reassigned successfully!');
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleReassign} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reassign Tasks
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
              <FolderKanban className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
              <CheckSquare className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedTasks} completed, {pendingTasks} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
              <Clock className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Teams
              </CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {teams.map(team => (
                <div key={team.id} className="space-y-2">
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  {team.members.map(member => {
                    const taskCount = getMemberTaskCount(team.id, member.id);
                    const isOverloaded = taskCount > member.capacity;
                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={isOverloaded ? "destructive" : "secondary"}>
                            {taskCount} / {member.capacity}
                          </Badge>
                          {isOverloaded && (
                            <p className="text-xs text-destructive mt-1">Overloaded</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activityLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activityLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                      <Clock className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
