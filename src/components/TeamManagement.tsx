import { useState } from "react";
import { Users, Plus, Edit2, Trash2, X, UserPlus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Team, TeamMember } from "../types";

export function TeamManagement() {
  const { teams, addTeam, updateTeam, deleteTeam, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberForm, setMemberForm] = useState({
    name: "",
    role: "",
    capacity: 3,
  });

  const openModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setTeamName(team.name);
      setMembers(team.members);
    } else {
      setEditingTeam(null);
      setTeamName("");
      setMembers([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    setTeamName("");
    setMembers([]);
    setMemberForm({ name: "", role: "", capacity: 3 });
  };

  const addMember = () => {
    if (memberForm.name.trim() && memberForm.role.trim()) {
      setMembers([
        ...members,
        {
          id: crypto.randomUUID(),
          name: memberForm.name.trim(),
          role: memberForm.role.trim(),
          capacity: memberForm.capacity,
        },
      ]);
      setMemberForm({ name: "", role: "", capacity: 3 });
    }
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleSubmit = () => {
    if (teamName.trim() && members.length > 0 && currentUser) {
      if (editingTeam) {
        updateTeam({
          ...editingTeam,
          name: teamName.trim(),
          members,
        });
      } else {
        addTeam({
          id: crypto.randomUUID(),
          name: teamName.trim(),
          members,
          createdBy: currentUser.id,
        });
      }
      closeModal();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Teams</h2>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black transition"
        >
          <Plus className="w-4 h-4" />
          New Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No teams yet</p>
          <button
            onClick={() => openModal()}
            className="text-blue-600 font-medium hover:text-blue-700"
          >
            Create your first team
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {teams.map(team => (
            <div
              key={team.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {team.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {team.members.length} member
                    {team.members.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(team)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTeam(team.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {team.members.map(member => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {member.name}
                      </p>
                      <p className="text-sm text-slate-600">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">
                        Capacity: {member.capacity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">
                {editingTeam ? "Edit Team" : "New Team"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Team Members
                </label>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      value={memberForm.name}
                      onChange={e =>
                        setMemberForm({ ...memberForm, name: e.target.value })
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={memberForm.role}
                      onChange={e =>
                        setMemberForm({ ...memberForm, role: e.target.value })
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Role"
                    />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={memberForm.capacity}
                      onChange={e =>
                        setMemberForm({
                          ...memberForm,
                          capacity: parseInt(e.target.value) || 3,
                        })
                      }
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Capacity"
                    />
                    <button
                      onClick={addMember}
                      className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {members.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {members.map(member => (
                        <div
                          key={member.id}
                          className="flex justify-between items-center p-3 bg-white rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-slate-800">
                              {member.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {member.role} • Capacity: {member.capacity}
                            </p>
                          </div>
                          <button
                            onClick={() => removeMember(member.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!teamName.trim() || members.length === 0}
                  className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-black transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {editingTeam ? "Update Team" : "Create Team"}
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
