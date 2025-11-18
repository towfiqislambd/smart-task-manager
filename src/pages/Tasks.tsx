import { useState } from 'react';
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Task } from '@/contexts/AppContext';

const Tasks = () => {
  const { tasks, projects, teams, addTask, updateTask, deleteTask, getProjectById, getTeamById, getMemberTaskCount } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Done'>('Pending');
  const [filterProject, setFilterProject] = useState('all');
  const [filterMember, setFilterMember] = useState('all');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setProjectId('');
    setAssignedTo('');
    setPriority('Medium');
    setStatus('Pending');
    setEditingTask(null);
  };

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description);
      setProjectId(task.projectId);
      setAssignedTo(task.assignedTo);
      setPriority(task.priority);
      setStatus(task.status);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleAssignmentChange = (memberId: string) => {
    setAssignedTo(memberId);
  };

  const handleSaveTask = () => {
    if (!title.trim() || !projectId || !assignedTo) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingTask) {
      const updatedTask = {
        ...editingTask,
        title,
        description,
        projectId,
        assignedTo,
        priority,
        status
      };
      updateTask(updatedTask);
      toast.success('Task updated successfully!');
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        description,
        projectId,
        assignedTo,
        priority,
        status
      };
      addTask(newTask);
      toast.success('Task created successfully!');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast.success('Task deleted successfully!');
  };

  const getTeamMembers = (projectId: string) => {
    const project = getProjectById(projectId);
    if (!project) return [];
    const team = getTeamById(project.teamId);
    return team?.members || [];
  };

  const filteredTasks = tasks.filter(task => {
    const projectMatch = filterProject === 'all' || task.projectId === filterProject;
    const memberMatch = filterMember === 'all' || task.assignedTo === filterMember;
    return projectMatch && memberMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-destructive';
      case 'Medium': return 'text-warning';
      case 'Low': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'Done': return 'default';
      case 'In Progress': return 'secondary';
      default: return 'outline';
    }
  };

  const getMemberName = (memberId: string, teamId: string) => {
    const team = getTeamById(teamId);
    return team?.members.find(m => m.id === memberId)?.name || 'Unassigned';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project *</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assigned To *</Label>
                    <Select value={assignedTo} onValueChange={handleAssignmentChange} disabled={!projectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTeamMembers(projectId).map(member => {
                          const project = getProjectById(projectId);
                          const taskCount = project ? getMemberTaskCount(project.teamId, member.id) : 0;
                          return (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({taskCount}/{member.capacity})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveTask} className="w-full">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterMember} onValueChange={setFilterMember}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {teams.flatMap(team => 
                team.members.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => {
            const project = getProjectById(task.projectId);
            const projectName = project?.name || 'Unknown';
            const memberName = project ? getMemberName(task.assignedTo, project.teamId) : 'Unknown';

            return (
              <Card key={task.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDialog(task)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Project:</span>
                      <span className="font-medium">{projectName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Assigned:</span>
                      <span className="font-medium">{memberName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks found. Create your first task!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;
