import React from 'react';
import { useThemeStore } from '../../store/index.js';
import { Users, Clock, TrendingUp } from 'lucide-react';

export const AdminDashboard = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [stats, setStats] = React.useState({
    totalClients: 24,
    totalHours: 1250,
    activeEmployees: 15
  });

  return (
    <div className={isDark ? 'bg-gray-950' : 'bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${isDark ? 'card-dark' : 'card'} p-6 flex items-start justify-between`}>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Clients</p>
              <p className="text-4xl font-bold mt-2">{stats.totalClients}</p>
            </div>
            <Users className="w-12 h-12 text-secondary opacity-20" />
          </div>

          <div className={`${isDark ? 'card-dark' : 'card'} p-6 flex items-start justify-between`}>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours Tracked</p>
              <p className="text-4xl font-bold mt-2">{stats.totalHours}</p>
            </div>
            <Clock className="w-12 h-12 text-secondary opacity-20" />
          </div>

          <div className={`${isDark ? 'card-dark' : 'card'} p-6 flex items-start justify-between`}>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Employees</p>
              <p className="text-4xl font-bold mt-2">{stats.activeEmployees}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-secondary opacity-20" />
          </div>
        </div>

        {/* Charts and other dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${isDark ? 'card-dark' : 'card'} p-6`}>
            <h2 className="text-2xl font-bold mb-4">Hours Tracked This Month</h2>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg h-64 flex items-center justify-center`}>
              <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>Chart will be displayed here</span>
            </div>
          </div>

          <div className={`${isDark ? 'card-dark' : 'card'} p-6`}>
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-lg`}>
                  <p className="font-medium">Employee logged hours</p>
                  <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>2 hours ago</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
