import { useMemo } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export function Dashboard() {
  const { projects, tasks, teams, activityLogs, reassignTasks } = useApp();

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "Done").length;
    const inProgressTasks = tasks.filter(
      t => t.status === "In Progress"
    ).length;

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
    };
  }, [projects, tasks]);

  const teamSummary = useMemo(() => {
    return teams.map(team => {
      const teamProjects = projects.filter(p => p.teamId === team.id);
      const teamProjectIds = teamProjects.map(p => p.id);

      const members = team.members.map(member => {
        const currentTasks = tasks.filter(
          t =>
            teamProjectIds.includes(t.projectId) &&
            t.assignedTo === member.id &&
            t.status !== "Done"
        ).length;

        const isOverloaded = currentTasks > member.capacity;

        return {
          ...member,
          currentTasks,
          isOverloaded,
        };
      });

      return {
        team,
        members,
      };
    });
  }, [teams, projects, tasks]);

  const recentLogs = activityLogs.slice(0, 5);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FolderKanban className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Projects</p>
          <p className="text-4xl font-bold">{stats.totalProjects}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <CheckSquare className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              {stats.totalTasks > 0
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                : 0}
              %
            </div>
          </div>
          <p className="text-green-100 text-sm mb-1">Total Tasks</p>
          <p className="text-4xl font-bold">{stats.totalTasks}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <RefreshCw className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              Active
            </div>
          </div>
          <p className="text-yellow-100 text-sm mb-1">In Progress</p>
          <p className="text-4xl font-bold">{stats.inProgressTasks}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
              Teams
            </div>
          </div>
          <p className="text-purple-100 text-sm mb-1">Total Members</p>
          <p className="text-4xl font-bold">
            {teams.reduce((sum, team) => sum + team.members.length, 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-800">
              Team Summary
            </h3>
            <button
              onClick={reassignTasks}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black transition"
            >
              <RefreshCw className="w-4 h-4" />
              Reassign Tasks
            </button>
          </div>

          {teamSummary.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No teams created yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {teamSummary.map(({ team, members }) => (
                <div key={team.id}>
                  <h4 className="font-semibold text-slate-800 mb-3">
                    {team.name}
                  </h4>
                  <div className="grid gap-3">
                    {members.map(member => (
                      <div
                        key={member.id}
                        className={`p-4 rounded-lg border-2 transition ${
                          member.isOverloaded
                            ? "bg-red-50 border-red-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-800">
                                {member.name}
                              </p>
                              {member.isOverloaded && (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <p className="text-sm text-slate-600">
                              {member.role}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${
                                member.isOverloaded
                                  ? "text-red-600"
                                  : "text-slate-800"
                              }`}
                            >
                              {member.currentTasks} / {member.capacity}
                            </p>
                            <p className="text-xs text-slate-600">tasks</p>
                          </div>
                        </div>
                        <div className="mt-3 bg-white rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              member.isOverloaded
                                ? "bg-red-500"
                                : member.currentTasks === member.capacity
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (member.currentTasks / member.capacity) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            Recent Reassignments
          </h3>

          {recentLogs.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 text-sm">No reassignments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div
                  key={log.id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium break-words">
                        {log.taskTitle}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {log.fromMember} → {log.toMember}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
