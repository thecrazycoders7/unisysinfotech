import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';
import { useThemeStore } from '../store/index.js';
import { Menu, X, Sun, Moon, LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-2xl shadow-xl ${isDark ? 'glass-dark bg-slate-900/60 border-b border-slate-700/50' : 'glass bg-white/60 border-b border-white/60'} animate-fade-in`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="/logo.png" 
              alt="UNISYS INFOTECH" 
              className="h-20 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-semibold transition-colors duration-300 relative group ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}>
              Home
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-indigo-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
            <Link to="/about" className={`text-sm font-semibold transition-colors duration-300 relative group ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}>
              About
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-indigo-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
            <Link to="/services" className={`text-sm font-semibold transition-colors duration-300 relative group ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}>
              Services
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-indigo-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
            <Link to="/careers" className={`text-sm font-semibold transition-colors duration-300 relative group ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}>
              Careers
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-indigo-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
            <Link to="/contact" className={`text-sm font-semibold transition-colors duration-300 relative group ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-700 hover:text-indigo-600'}`}>
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-indigo-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all duration-300 ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className={`text-sm hidden sm:inline font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{user.name}</span>
                <Link 
                  to={
                    user.role === 'admin' ? '/admin/dashboard' : 
                    user.role === 'employer' ? '/employer/dashboard' : 
                    user.role === 'employee' ? '/employee/timecards' : 
                    '/user/dashboard'
                  } 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 text-xs sm:text-sm shadow-lg"
                >
                  {user.role === 'admin' ? 'Admin Panel' : 
                   user.role === 'employer' ? 'Employer Dashboard' : 
                   user.role === 'employee' ? 'My Timecards' : 
                   'Dashboard'}
                </Link>
                <button onClick={handleLogout} className={`p-2 rounded-lg transition-all duration-300 ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-700'}`} title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className={`p-2 rounded-lg transition-all duration-300 ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-indigo-400' : 'hover:bg-slate-100 text-slate-600 hover:text-indigo-600'}`} title="Login">
                <User size={22} />
              </Link>
            )}

            {/* Mobile menu button */}
            <button className={`md:hidden p-2 rounded-lg transition-all duration-300 ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`} onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-borderLight backdrop-blur-sm animate-slide-up">
            <Link to="/" className="block px-4 py-2 rounded transition-all duration-300 hover:bg-primary/10 font-medium text-textPrimary">Home</Link>
            <Link to="/about" className="block px-4 py-2 rounded transition-all duration-300 hover:bg-primary/10 font-medium text-textPrimary">About</Link>
            <Link to="/services" className="block px-4 py-2 rounded transition-all duration-300 hover:bg-primary/10 font-medium text-textPrimary">Services</Link>
            <Link to="/careers" className="block px-4 py-2 rounded transition-all duration-300 hover:bg-primary/10 font-medium text-textPrimary">Careers</Link>
            <Link to="/contact" className="block px-4 py-2 rounded transition-all duration-300 hover:bg-primary/10 font-medium text-textPrimary">Contact</Link>
            {user && (
              <Link 
                to={
                  user.role === 'admin' ? '/admin/dashboard' : 
                  user.role === 'employer' ? '/employer/dashboard' : 
                  user.role === 'employee' ? '/employee/timecards' : 
                  '/user/dashboard'
                } 
                className="block px-4 py-2 rounded transition-all duration-300 bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                {user.role === 'admin' ? 'Admin Panel' : 
                 user.role === 'employer' ? 'Employer Dashboard' : 
                 user.role === 'employee' ? 'My Timecards' : 
                 'Dashboard'}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
