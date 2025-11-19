import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useApp();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-primary rounded-full">
              <LogIn className="text-primary-foreground" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-center mb-8">
            Sign in to manage your tasks
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="admin@taskmanager.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">Email: admin@taskmanager.com</p>
            <p className="text-xs text-muted-foreground">Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
