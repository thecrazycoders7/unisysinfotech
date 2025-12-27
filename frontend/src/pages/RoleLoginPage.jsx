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
      title: 'Employer Login',
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
      title: 'Admin Portal',
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
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRoleSelection = () => {
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'} p-4 animate-fade-in`}>
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-md p-8 animate-scale-in shadow-xl`}>
        {/* Header with icon */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full bg-${config.color}-600 flex items-center justify-center mx-auto mb-4`}>
            <Icon size={40} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {config.title}
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {config.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-2`}>
              Email Address
            </label>
            <div className={`flex items-center gap-2 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} border ${isDark ? 'border-slate-600' : 'border-slate-300'} rounded-lg px-4 py-3 focus-within:border-${config.color}-600 transition-colors duration-300`}>
              <Mail size={18} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500'}`}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'} mb-2`}>
              Password
            </label>
            <div className={`flex items-center gap-2 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} border ${isDark ? 'border-slate-600' : 'border-slate-300'} rounded-lg px-4 py-3 focus-within:border-${config.color}-600 transition-colors duration-300`}>
              <Lock size={18} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500'}`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-${config.color}-600 hover:bg-${config.color}-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={handleBackToRoleSelection}
            className={`text-sm ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'} transition-colors`}
          >
            ← Back to role selection
          </button>
          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>|</span>
          <button
            onClick={() => navigate('/')}
            className={`text-sm flex items-center gap-1 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'} transition-colors`}
          >
            <Home size={16} />
            Homepage
          </button>
        </div>

        <div className={`mt-6 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
          <p>Need help? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
};
