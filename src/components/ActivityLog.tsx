import { Clock, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ActivityLog() {
  const { activityLogs } = useApp();

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-800">Activity Log</h2>
      </div>

      {activityLogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No activity yet</p>
          <p className="text-sm text-slate-500 mt-2">
            Task reassignments will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-slate-50 transition">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium mb-1">
                      Task "{log.taskTitle}" reassigned
                    </p>
                    <p className="text-slate-600 text-sm mb-2">
                      From <span className="font-medium">{log.fromMember}</span> to{' '}
                      <span className="font-medium">{log.toMember}</span>
                    </p>
                    <p className="text-slate-500 text-xs">
                      {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
