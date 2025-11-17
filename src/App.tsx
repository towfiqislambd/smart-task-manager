import { useState } from 'react';
import { useApp } from './context/AppContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TeamManagement } from './components/TeamManagement';
import { ProjectManagement } from './components/ProjectManagement';
import { TaskManagement } from './components/TaskManagement';
import { ActivityLog } from './components/ActivityLog';

function App() {
  const { currentUser } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'teams' && <TeamManagement />}
      {currentView === 'projects' && <ProjectManagement />}
      {currentView === 'tasks' && <TaskManagement />}
      {currentView === 'activity' && <ActivityLog />}
    </Layout>
  );
}

export default App;
