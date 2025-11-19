import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Teams from './pages/Teams';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: (
      <AppProvider>
        <Login />
      </AppProvider>
    )
  },
  {
    path: '/register',
    element: (
      <AppProvider>
        <Register />
      </AppProvider>
    )
  },
  {
    path: '/dashboard',
    element: (
      <AppProvider>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </AppProvider>
    )
  },
  {
    path: '/projects',
    element: (
      <AppProvider>
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      </AppProvider>
    )
  },
  {
    path: '/tasks',
    element: (
      <AppProvider>
        <ProtectedRoute>
          <Tasks />
        </ProtectedRoute>
      </AppProvider>
    )
  },
  {
    path: '/teams',
    element: (
      <AppProvider>
        <ProtectedRoute>
          <Teams />
        </ProtectedRoute>
      </AppProvider>
    )
  },
  {
    path: '*',
    element: <NotFound />
  }
]);
