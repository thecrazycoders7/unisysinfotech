import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/index.js';
import { Users, Clock, TrendingUp, Briefcase, Mail, UserCheck, Activity, Calendar } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminAPI, clientAPI, timeCardAPI, jobsApi, contactMessageApi } from '../../api/endpoints.js';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalHours: 0,
    activeEmployees: 0,
    jobPostings: 0,
    contactMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [userDistributionData, setUserDistributionData] = useState([]);
  const [hoursTrendData, setHoursTrendData] = useState([]);
  const [monthlyHoursData, setMonthlyHoursData] = useState([]);

  // Fetch real dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Calculate date ranges
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Fetch all data in parallel
      const [usersRes, clientsRes, jobsRes, messagesRes, timecardsRes, statsRes] = await Promise.all([
        adminAPI.getUsers().catch(() => ({ data: { users: [] } })),
        clientAPI.getAll().catch(() => ({ data: [] })),
        jobsApi.getAllAdmin().catch(() => ({ data: { data: [] } })),
        contactMessageApi.getAll({ status: 'new' }).catch(() => ({ data: { data: [] } })),
        timeCardAPI.getAllEntries({ 
          startDate: firstDayOfMonth.toISOString(), 
          endDate: lastDayOfMonth.toISOString() 
        }).catch(() => ({ data: { totalHours: 0, timeCards: [] } })),
        timeCardAPI.getStats({ 
          startDate: firstDayOfMonth.toISOString(), 
          endDate: lastDayOfMonth.toISOString() 
        }).catch(() => ({ data: { stats: { totalHours: 0, hoursByDay: {} } } }))
      ]);

      const users = usersRes.data.users || [];
      const clients = clientsRes.data || [];
      const jobs = jobsRes.data.data || [];
      const messages = messagesRes.data.data || [];
      const timecardData = timecardsRes.data || { totalHours: 0, timeCards: [] };
      const statsData = statsRes.data.stats || { totalHours: 0, hoursByDay: {} };

      // Calculate stats
      const activeEmployees = users.filter(u => u.role === 'employee' && u.isActive !== false).length;
      const employees = users.filter(u => u.role === 'employee').length;
      const employers = users.filter(u => u.role === 'employer').length;
      const admins = users.filter(u => u.role === 'admin').length;
      const inactive = users.filter(u => u.isActive === false).length;

      setStats({
        totalUsers: users.length,
        totalClients: clients.length,
        totalHours: Math.round(timecardData.totalHours || 0),
        activeEmployees: activeEmployees,
        jobPostings: jobs.length,
        contactMessages: messages.length
      });

      // Set user distribution data from real counts
      setUserDistributionData([
        { name: 'Employees', value: employees, color: '#3b82f6' },
        { name: 'Employers', value: employers, color: '#8b5cf6' },
        { name: 'Admins', value: admins, color: '#10b981' },
        { name: 'Inactive', value: inactive, color: '#6b7280' }
      ]);

      // Set hours trend data from real stats
      const hoursByDay = statsData.hoursByDay || {};
      setHoursTrendData([
        { day: 'Mon', hours: Math.round(hoursByDay.Mon || 0), target: 40 },
        { day: 'Tue', hours: Math.round(hoursByDay.Tue || 0), target: 40 },
        { day: 'Wed', hours: Math.round(hoursByDay.Wed || 0), target: 40 },
        { day: 'Thu', hours: Math.round(hoursByDay.Thu || 0), target: 40 },
        { day: 'Fri', hours: Math.round(hoursByDay.Fri || 0), target: 40 },
        { day: 'Sat', hours: Math.round(hoursByDay.Sat || 0), target: 40 },
        { day: 'Sun', hours: Math.round(hoursByDay.Sun || 0), target: 40 }
      ]);

      // Initialize monthly hours data (can be expanded later)
      setMonthlyHoursData([]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex items-start justify-between hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div>
              <p className="text-sm font-medium text-slate-200">Total Users</p>
              <p className="text-4xl font-bold mt-2 text-white">{stats.totalUsers}</p>
              <p className="text-xs text-slate-300 mt-1">All system users</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex items-start justify-between hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div>
              <p className="text-sm font-medium text-slate-200">Total Clients</p>
              <p className="text-4xl font-bold mt-2 text-white">{stats.totalClients}</p>
              <p className="text-xs text-slate-300 mt-1">Active clients</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex items-start justify-between hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div>
              <p className="text-sm font-medium text-slate-200">Hours Tracked</p>
              <p className="text-4xl font-bold mt-2 text-white">{stats.totalHours}</p>
              <p className="text-xs text-slate-300 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex items-start justify-between hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div>
              <p className="text-sm font-medium text-slate-200">Active Employees</p>
              <p className="text-4xl font-bold mt-2 text-white">{stats.activeEmployees}</p>
              <p className="text-xs text-slate-300 mt-1">Currently active</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex items-start justify-between hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div>
              <p className="text-sm font-medium text-slate-200">Job Postings</p>
              <p className="text-4xl font-bold mt-2 text-white">{stats.jobPostings}</p>
              <p className="text-xs text-slate-300 mt-1">Open positions</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex items-start justify-between hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <div>
              <p className="text-sm font-medium text-slate-200">Contact Messages</p>
              <p className="text-4xl font-bold mt-2 text-white">{stats.contactMessages}</p>
              <p className="text-xs text-slate-300 mt-1">Unread messages</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-pink-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105 text-left cursor-pointer"
            >
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <p className="font-semibold text-white">Manage Users</p>
              <p className="text-xs text-slate-300 mt-1">Create and edit users</p>
            </button>
            <button 
              onClick={() => navigate('/admin/clients')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105 text-left cursor-pointer"
            >
              <Briefcase className="w-8 h-8 text-green-400 mb-2" />
              <p className="font-semibold text-white">Manage Clients</p>
              <p className="text-xs text-slate-300 mt-1">View client list</p>
            </button>
            <button 
              onClick={() => navigate('/admin/reports')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105 text-left cursor-pointer"
            >
              <Activity className="w-8 h-8 text-purple-400 mb-2" />
              <p className="font-semibold text-white">View Reports</p>
              <p className="text-xs text-slate-300 mt-1">Analytics & insights</p>
            </button>
            <button 
              onClick={() => navigate('/admin/contact-messages')}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105 text-left cursor-pointer"
            >
              <Mail className="w-8 h-8 text-pink-400 mb-2" />
              <p className="font-semibold text-white">Contact Messages</p>
              <p className="text-xs text-slate-300 mt-1">View inquiries</p>
            </button>
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Weekly Hours Trend</h2>
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={hoursTrendData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">User Distribution</h2>
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div className="space-y-3">
              {[
                { action: 'New user registered', user: 'John Doe', time: '5 minutes ago', icon: Users, color: 'blue' },
                { action: 'Hours logged', user: 'Sarah Smith', time: '1 hour ago', icon: Clock, color: 'purple' },
                { action: 'Contact message received', user: 'Tech Corp', time: '2 hours ago', icon: Mail, color: 'pink' },
                { action: 'Client added', user: 'Admin User', time: '3 hours ago', icon: Briefcase, color: 'green' },
                { action: 'Job posting created', user: 'HR Manager', time: '5 hours ago', icon: Briefcase, color: 'orange' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full bg-${item.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 text-${item.color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{item.action}</p>
                        <p className="text-slate-300 text-xs mt-0.5">{item.user}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{item.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>

        {/* System Status */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Database</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-400">Connected & Operational</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">API Server</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              </div>
              <p className="text-xs text-slate-400">Running on Port 5001</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Last Backup</span>
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>
              <p className="text-xs text-slate-400">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
