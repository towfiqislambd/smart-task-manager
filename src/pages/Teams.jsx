import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useApp } from '../contexts/AppContext';
import { Plus, Users, Trash2, Edit2, X, UserPlus } from 'lucide-react';

const Teams = () => {
  const { data, createTeam, modifyTeam, removeTeam, getMemberTaskCount } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', members: [] });
  const [newMember, setNewMember] = useState({ name: '', role: '', capacity: 3 });

  const openModal = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({ name: team.name, members: [...team.members] });
    } else {
      setEditingTeam(null);
      setFormData({ name: '', members: [] });
    }
    setNewMember({ name: '', role: '', capacity: 3 });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    setFormData({ name: '', members: [] });
  };

  const handleAddMember = () => {
    if (newMember.name && newMember.role) {
      setFormData({
        ...formData,
        members: [...formData.members, { ...newMember, id: Date.now() }]
      });
      setNewMember({ name: '', role: '', capacity: 3 });
    }
  };

  const handleRemoveMember = (memberId) => {
    setFormData({
      ...formData,
      members: formData.members.filter(m => m.id !== memberId)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.members.length === 0) {
      alert('Please add at least one team member');
      return;
    }
    if (editingTeam) {
      modifyTeam(editingTeam.id, formData);
    } else {
      createTeam(formData);
    }
    closeModal();
  };

  const handleDelete = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? This will affect associated projects.')) {
      removeTeam(teamId);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-muted-foreground mt-1">Manage your teams and members</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Team</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.teams.map(team => (
            <div key={team.id} className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">{team.members.length} members</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(team)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Edit2 size={16} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {team.members.map(member => {
                  const taskCount = getMemberTaskCount(member.id);
                  const isOverloaded = taskCount > member.capacity;
                  const percentage = (taskCount / member.capacity) * 100;

                  return (
                    <div key={member.id} className="bg-secondary rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        <span className={`text-sm font-semibold ${
                          isOverloaded ? 'text-warning' : 'text-success'
                        }`}>
                          {taskCount} / {member.capacity}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isOverloaded ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {data.teams.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No teams yet. Create your first team!</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {editingTeam ? 'Edit Team' : 'New Team'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-secondary rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Team Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Team Members</label>
                    <span className="text-xs text-muted-foreground">{formData.members.length} members</span>
                  </div>

                  <div className="bg-secondary rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Capacity"
                        min="0"
                        max="10"
                        value={newMember.capacity}
                        onChange={(e) => setNewMember({ ...newMember, capacity: parseInt(e.target.value) })}
                        className="px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                      >
                        <UserPlus size={18} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {formData.members.length > 0 && (
                    <div className="space-y-2">
                      {formData.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between bg-secondary rounded-lg p-3">
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.role} • Capacity: {member.capacity}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    {editingTeam ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Teams;
