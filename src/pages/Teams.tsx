import { useState } from 'react';
import Layout from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Teams = () => {
  const { teams, addTeam, updateTeam, getMemberTaskCount } = useApp();
  const [teamName, setTeamName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberCapacity, setMemberCapacity] = useState(3);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast.error('Please enter team name');
      return;
    }

    const newTeam = {
      id: Date.now().toString(),
      name: teamName,
      members: []
    };

    addTeam(newTeam);
    setTeamName('');
    setIsDialogOpen(false);
    toast.success('Team created successfully!');
  };

  const handleAddMember = () => {
    if (!memberName.trim() || !memberRole.trim() || !selectedTeam) {
      toast.error('Please fill all fields');
      return;
    }

    const team = teams.find(t => t.id === selectedTeam);
    if (!team) return;

    const newMember = {
      id: Date.now().toString(),
      name: memberName,
      role: memberRole,
      capacity: memberCapacity
    };

    const updatedTeam = {
      ...team,
      members: [...team.members, newMember]
    };

    updateTeam(updatedTeam);
    setMemberName('');
    setMemberRole('');
    setMemberCapacity(3);
    setIsMemberDialogOpen(false);
    toast.success('Member added successfully!');
  };

  const handleRemoveMember = (teamId: string, memberId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const updatedTeam = {
      ...team,
      members: team.members.filter(m => m.id !== memberId)
    };

    updateTeam(updatedTeam);
    toast.success('Member removed successfully!');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teams</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateTeam} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map(team => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle>{team.name}</CardTitle>
                  </div>
                  <Dialog open={isMemberDialogOpen && selectedTeam === team.id} onOpenChange={(open) => {
                    setIsMemberDialogOpen(open);
                    if (open) setSelectedTeam(team.id);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            placeholder="Member name"
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input
                            placeholder="Member role"
                            value={memberRole}
                            onChange={(e) => setMemberRole(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Capacity (max tasks)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={memberCapacity}
                            onChange={(e) => setMemberCapacity(Number(e.target.value))}
                          />
                        </div>
                        <Button onClick={handleAddMember} className="w-full">Add Member</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {team.members.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No members yet</p>
                ) : (
                  <div className="space-y-2">
                    {team.members.map(member => {
                      const taskCount = getMemberTaskCount(team.id, member.id);
                      const isOverloaded = taskCount > member.capacity;
                      return (
                        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={isOverloaded ? "destructive" : "secondary"}>
                              {taskCount} / {member.capacity}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMember(team.id, member.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Teams;
