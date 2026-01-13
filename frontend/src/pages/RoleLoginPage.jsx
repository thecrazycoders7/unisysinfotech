import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store/index.js';
import { authAPI } from '../api/endpoints.js';
import { toast } from 'react-toastify';
import { Lock, Mail, Briefcase, Users, Shield, Home } from 'lucide-react';

/**
 * Role-Specific Login Component
 * Handles login for Employer, Employee, and Admin roles
 * Validates credentials against selected role
 */
export const RoleLoginPage = () => {
  const { role } = useParams(); // 'employer', 'employee', or 'admin'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const isDark = useThemeStore((state) => state.isDark);

  // Role configuration
  const roleConfig = {
    employer: {
      title: 'Manager Login',
      description: 'Access your team dashboard',
      icon: Briefcase,
      color: 'indigo',
      redirectPath: '/employer/dashboard'
    },
    employee: {
      title: 'Employee Login',
      description: 'Manage your timecards',
      icon: Users,
      color: 'blue',
      redirectPath: '/employee/timecards'
    },
    admin: {
      title: 'Admin/Manager Portal',
      description: 'System administration',
      icon: Shield,
      color: 'purple',
      redirectPath: '/admin/dashboard'
    }
  };

  const config = roleConfig[role] || roleConfig.admin;
  const Icon = config.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send selected role to backend for validation
      const response = await authAPI.login({ 
        email, 
        password, 
        selectedRole: role 
      });

      setToken(response.data.token);
      setUser(response.data.user);
      toast.success(`Welcome back, ${response.data.user.name}!`);
      
      // Navigate based on user's actual role
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.data.user.role === 'employer') {
        navigate('/employer/dashboard');
      } else if (response.data.user.role === 'employee') {
        navigate('/employee/timecards');
      } else {
        navigate('/user/dashboard'); // Fallback for legacy users
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please ensure the backend server is running on port 5001.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    
    // Auto-fill credentials based on role
    const credentials = {
      admin: { email: 'admin@unisys.com', password: 'password123' },
      employer: { email: 'employer@unisys.com', password: 'password123' },
      employee: { email: 'employee@unisys.com', password: 'password123' }
    };

    const creds = credentials[role] || credentials.admin;

    try {
      console.log('Quick login attempt:', { email: creds.email, role });
      
      const response = await authAPI.login({ 
        email: creds.email, 
        password: creds.password, 
        selectedRole: role 
      });

      console.log('Login response:', response.data);

      // Store token and user in localStorage and state
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setToken(response.data.token);
      setUser(response.data.user);
      
      console.log('Token set:', response.data.token);
      console.log('User set:', response.data.user);
      
      toast.success(`Welcome back, ${response.data.user.name}!`);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        // Navigate based on user's actual role
        if (response.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (response.data.user.role === 'employer') {
          navigate('/employer/dashboard');
        } else if (response.data.user.role === 'employee') {
          navigate('/employee/timecards');
        } else {
          navigate('/user/dashboard');
        }
      }, 100);
    } catch (error) {
      console.error('Quick login error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to server. Please ensure the backend server is running on port 5001.');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Quick login failed. Check console for details.';
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRoleSelection = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in relative overflow-hidden bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl w-full max-w-md p-8 animate-scale-in shadow-2xl">
        {/* Header with icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900">
            {config.title}
          </h1>
          <p className="text-slate-600">
            {config.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-300">
              <Mail size={18} className="text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-300">
              <Lock size={18} className="text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900/90 backdrop-blur-lg hover:bg-slate-900 text-white font-bold py-3.5 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl border border-white/10"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Quick Login Button - Only visible in development */}
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Logging in...' : '⚡ Quick Login (Dev)'}
            </button>
          )}
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Home size={16} />
            Back to Homepage
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Need help? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
};
