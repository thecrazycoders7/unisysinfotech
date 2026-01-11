import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useThemeStore } from '../../store/index.js';
import { reportsAPI, timeCardAPI, adminAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { BarChart3, PieChart, TrendingUp, Users, Clock, Download, Calendar, FileSpreadsheet, FileText, RefreshCw, Loader2, Wifi, WifiOff } from 'lucide-react';
import supabase from '../../config/supabase.js';

// Lazy load Recharts components for better performance
const RechartsComponents = lazy(() => import('recharts').then(module => ({
  default: () => null,
  BarChart: module.BarChart,
  Bar: module.Bar,
  LineChart: module.LineChart,
  Line: module.Line,
  PieChart: module.PieChart,
  Pie: module.Pie,
  Cell: module.Cell,
  XAxis: module.XAxis,
  YAxis: module.YAxis,
  CartesianGrid: module.CartesianGrid,
  Tooltip: module.Tooltip,
  Legend: module.Legend,
  ResponsiveContainer: module.ResponsiveContainer
})));

// Import recharts directly for the component
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AdminReports = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [hoursSummary, setHoursSummary] = useState([]);
  const [clientActivity, setClientActivity] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch all reports data
  const fetchReports = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [hourRes, clientRes, usersRes] = await Promise.all([
        reportsAPI.getHoursSummary(),
        reportsAPI.getClientActivity(),
        adminAPI.getUsers()
      ]);
      
      setHoursSummary(hourRes.data.summary || []);
      setClientActivity(clientRes.data.report || []);
      
      const allUsers = usersRes.data.users || [];
      setEmployeeData(allUsers);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Set up Supabase real-time subscriptions
  useEffect(() => {
    // Subscribe to users table changes
    const usersChannel = supabase
      .channel('reports-users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Users change detected:', payload.eventType);
          // Refetch data on any change
          fetchReports(true);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to time_cards table changes
    const timeCardsChannel = supabase
      .channel('reports-timecards-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_cards' },
        (payload) => {
          console.log('Time cards change detected:', payload.eventType);
          // Refetch data on any change
          fetchReports(true);
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(timeCardsChannel);
    };
  }, [fetchReports]);

  // Filter data based on active tab
  const getFilteredData = useCallback(() => {
    if (activeTab === 'employers') {
      return employeeData.filter(user => user.role === 'employer');
    }
    return employeeData.filter(user => user.role === 'employee');
  }, [activeTab, employeeData]);

  const filteredEmployeeData = getFilteredData();

  // Helper function to convert data to CSV
  const convertToCSV = (data, headers) => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  };

  // Download CSV file
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export comprehensive employee/employer report
  const exportEmployeeReport = async () => {
    setExporting(true);
    try {
      let timecards = [];
      
      try {
        const timecardsRes = await timeCardAPI.getAllEntries();
        timecards = timecardsRes.data.timeCards || [];
      } catch (tcError) {
        console.warn('Could not fetch timecards, exporting user list only:', tcError);
      }

      const reportData = [];
      const targetRole = activeTab === 'employers' ? 'employer' : 'employee';
      
      if (filteredEmployeeData.length === 0) {
        toast.error(`No ${targetRole} data available to export`);
        return;
      }
      
      filteredEmployeeData.forEach(user => {
        if (user.role === targetRole) {
          const manager = employeeData.find(u => u._id === user.employerId);
          const userTimecards = timecards.filter(tc => 
            tc.employeeId?._id === user._id || tc.employeeId === user._id
          );
          
          if (userTimecards.length > 0) {
            userTimecards.forEach(tc => {
              reportData.push({
                'Name': user.name,
                'Email': user.email,
                'Role': user.role.charAt(0).toUpperCase() + user.role.slice(1),
                'Department': user.department || 'N/A',
                'Designation': user.designation || 'N/A',
                'Reports To': manager?.name || 'N/A',
                'Manager Email': manager?.email || 'N/A',
                'Date': new Date(tc.date).toLocaleDateString(),
                'Hours Worked': tc.hoursWorked || tc.hours || 0,
                'Project/Client': tc.client?.name || tc.clientName || 'Unassigned',
                'Notes': tc.notes || '',
                'Status': tc.isLocked ? 'Locked' : 'Open'
              });
            });
          } else {
            reportData.push({
              'Name': user.name,
              'Email': user.email,
              'Role': user.role.charAt(0).toUpperCase() + user.role.slice(1),
              'Department': user.department || 'N/A',
              'Designation': user.designation || 'N/A',
              'Reports To': manager?.name || 'N/A',
              'Manager Email': manager?.email || 'N/A',
              'Date': 'No entries',
              'Hours Worked': 0,
              'Project/Client': 'N/A',
              'Notes': '',
              'Status': 'No data'
            });
          }
        }
      });

      if (reportData.length === 0) {
        toast.error(`No ${targetRole} data to export`);
        return;
      }

      const headers = ['Name', 'Email', 'Role', 'Department', 'Designation', 'Reports To', 'Manager Email', 'Date', 'Hours Worked', 'Project/Client', 'Notes', 'Status'];
      const csv = convertToCSV(reportData, headers);
      downloadCSV(csv, `${targetRole}_hours_report_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success(`${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} report exported successfully! (${reportData.length} records)`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${targetRole} report: ${error.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  // Export employee/employer summary
  const exportEmployeeSummary = async () => {
    setExporting(true);
    try {
      let timecards = [];
      const targetRole = activeTab === 'employers' ? 'employer' : 'employee';
      
      try {
        const timecardsRes = await timeCardAPI.getAllEntries();
        timecards = timecardsRes.data.timeCards || [];
      } catch (tcError) {
        console.warn('Could not fetch timecards, exporting user list only:', tcError);
      }

      const summaryData = [];
      
      if (filteredEmployeeData.length === 0) {
        toast.error(`No ${targetRole} data available to export`);
        return;
      }
      
      filteredEmployeeData.forEach(user => {
        if (user.role === targetRole) {
          const manager = employeeData.find(u => u._id === user.employerId);
          const userTimecards = timecards.filter(tc => 
            tc.employeeId?._id === user._id || tc.employeeId === user._id
          );
          const totalHours = userTimecards.reduce((sum, tc) => sum + (tc.hoursWorked || tc.hours || 0), 0);
          const daysWorked = userTimecards.length;
          
          summaryData.push({
            'Name': user.name,
            'Email': user.email,
            'Role': user.role.charAt(0).toUpperCase() + user.role.slice(1),
            'Department': user.department || 'N/A',
            'Designation': user.designation || 'N/A',
            'Reports To': manager?.name || 'N/A',
            'Total Hours': totalHours.toFixed(2),
            'Days Worked': daysWorked,
            'Average Hours/Day': daysWorked > 0 ? (totalHours / daysWorked).toFixed(2) : '0.00',
            'Status': user.isActive !== false ? 'Active' : 'Inactive'
          });
        }
      });

      if (summaryData.length === 0) {
        toast.error(`No ${targetRole} data to export`);
        return;
      }

      const headers = ['Name', 'Email', 'Role', 'Department', 'Designation', 'Reports To', 'Total Hours', 'Days Worked', 'Average Hours/Day', 'Status'];
      const csv = convertToCSV(summaryData, headers);
      downloadCSV(csv, `${targetRole}_summary_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success(`${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} summary exported successfully! (${summaryData.length} records)`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${targetRole} summary: ${error.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  // Export client report
  const exportClientReport = () => {
    setExporting(true);
    try {
      if (clientActivity.length === 0) {
        toast.error('No client data available to export');
        return;
      }
      
      const reportData = clientActivity.map(item => ({
        'Client/Project': item.clientName || 'Unassigned',
        'Total Hours': (item.totalHours || 0).toFixed(2),
        'Number of Entries': item.count || 0,
        'Average Hours per Entry': item.count ? ((item.totalHours || 0) / item.count).toFixed(2) : '0.00',
        'Percentage of Total': ((item.totalHours / clientActivity.reduce((sum, c) => sum + (c.totalHours || 0), 0)) * 100).toFixed(2) + '%'
      }));

      const headers = ['Client/Project', 'Total Hours', 'Number of Entries', 'Average Hours per Entry', 'Percentage of Total'];
      const csv = convertToCSV(reportData, headers);
      downloadCSV(csv, `client_report_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Client report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export client report');
    } finally {
      setExporting(false);
    }
  };

  // Export monthly summary
  const exportMonthlySummary = () => {
    setExporting(true);
    try {
      if (hoursSummary.length === 0) {
        toast.error('No monthly data available to export');
        return;
      }
      
      const reportData = hoursSummary.map(item => ({
        'Month': item._id?.month || 'Unknown',
        'Total Hours': (item.totalHours || 0).toFixed(2),
        'Number of Entries': item.count || 0,
        'Average Hours per Entry': item.count ? ((item.totalHours || 0) / item.count).toFixed(2) : '0.00'
      }));

      const headers = ['Month', 'Total Hours', 'Number of Entries', 'Average Hours per Entry'];
      const csv = convertToCSV(reportData, headers);
      downloadCSV(csv, `monthly_summary_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Monthly summary exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export monthly summary');
    } finally {
      setExporting(false);
    }
  };

  // Calculate role-specific stats
  const getRoleSpecificStats = useMemo(() => {
    const targetRole = activeTab === 'employers' ? 'employer' : 'employee';
    const roleUsers = filteredEmployeeData.filter(u => u.role === targetRole);
    const activeUsers = roleUsers.filter(u => u.isActive !== false);
    
    return {
      totalUsers: roleUsers.length,
      activeUsers: activeUsers.length,
      roleName: targetRole.charAt(0).toUpperCase() + targetRole.slice(1) + 's'
    };
  }, [activeTab, filteredEmployeeData]);

  // Calculate totals
  const totalHours = useMemo(() => hoursSummary.reduce((sum, item) => sum + (item.totalHours || 0), 0), [hoursSummary]);
  const totalEntries = useMemo(() => hoursSummary.reduce((sum, item) => sum + (item.count || 0), 0), [hoursSummary]);
  const totalClients = clientActivity.length;
  const avgHoursPerEntry = totalEntries > 0 ? totalHours / totalEntries : 0;

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString();
  };

  // Skeleton Components
  const StatCardSkeleton = () => (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 bg-white/20 rounded-xl"></div>
        <div className="w-6 h-6 bg-white/20 rounded"></div>
      </div>
      <div className="w-24 h-4 bg-white/20 rounded mb-2"></div>
      <div className="w-16 h-10 bg-white/20 rounded mb-2"></div>
      <div className="w-32 h-3 bg-white/20 rounded"></div>
    </div>
  );

  const ChartSkeleton = ({ height = 400 }) => (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-white/20 rounded-lg"></div>
        <div className="w-48 h-6 bg-white/20 rounded"></div>
      </div>
      <div className={`bg-white/5 rounded-xl flex items-center justify-center`} style={{ height }}>
        <Loader2 size={32} className="text-blue-400 animate-spin" />
      </div>
    </div>
  );

  const ExportSkeleton = () => (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-white/20 rounded"></div>
        <div className="w-48 h-6 bg-white/20 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 bg-white/20 rounded-xl"></div>
        ))}
      </div>
      <div className="w-96 h-4 bg-white/20 rounded mt-4"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Reports & Analytics</h1>
              <p className="text-slate-300">View system reports and analytics</p>
              {lastUpdated && (
                <p className="text-slate-500 text-sm mt-1">
                  Last updated: {formatLastUpdated()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                <span className="text-sm font-medium">{isConnected ? 'Live' : 'Offline'}</span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={() => fetchReports(true)}
                disabled={refreshing || loading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300"
                title="Refresh data"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'employees'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              Employee Timecards
            </button>
            <button
              onClick={() => setActiveTab('employers')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'employers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              Employer Timecards
            </button>
          </div>

          {/* Export Options */}
          {loading ? (
            <ExportSkeleton />
          ) : (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileSpreadsheet className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">Export Reports - {activeTab === 'employees' ? 'Employees' : 'Employers'}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={exportEmployeeReport}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {exporting ? 'Exporting...' : `${activeTab === 'employers' ? 'Employer' : 'Employee'} Details`}
                </button>
                
                <button 
                  onClick={exportEmployeeSummary}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
                  {exporting ? 'Exporting...' : `${activeTab === 'employers' ? 'Employer' : 'Employee'} Summary`}
                </button>
                
                <button 
                  onClick={exportClientReport}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                  {exporting ? 'Exporting...' : 'Client Report'}
                </button>
                
                <button 
                  onClick={exportMonthlySummary}
                  disabled={exporting}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                  {exporting ? 'Exporting...' : 'Monthly Summary'}
                </button>
              </div>
              <p className="text-slate-400 text-sm mt-4">
                <FileText className="w-4 h-4 inline mr-1" />
                Export comprehensive reports including {activeTab === 'employers' ? 'employer' : 'employee'} hours, projects, managers, and detailed analytics in CSV format.
              </p>
            </div>
          )}

          {/* Role-Specific Stats */}
          {loading ? (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mt-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-32 h-4 bg-white/20 rounded mb-3"></div>
                  <div className="flex items-baseline gap-4 mt-2">
                    <div>
                      <div className="w-12 h-8 bg-white/20 rounded mb-1"></div>
                      <div className="w-24 h-3 bg-white/20 rounded"></div>
                    </div>
                    <div>
                      <div className="w-10 h-7 bg-white/20 rounded mb-1"></div>
                      <div className="w-12 h-3 bg-white/20 rounded"></div>
                    </div>
                    <div>
                      <div className="w-10 h-7 bg-white/20 rounded mb-1"></div>
                      <div className="w-16 h-3 bg-white/20 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-xl"></div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6 shadow-xl mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium mb-1">
                    {getRoleSpecificStats.roleName} Overview
                  </h3>
                  <div className="flex items-baseline gap-4 mt-2">
                    <div>
                      <p className="text-3xl font-bold text-white">{getRoleSpecificStats.totalUsers}</p>
                      <p className="text-slate-400 text-xs mt-1">Total {getRoleSpecificStats.roleName}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">{getRoleSpecificStats.activeUsers}</p>
                      <p className="text-slate-400 text-xs mt-1">Active</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-400">{getRoleSpecificStats.totalUsers - getRoleSpecificStats.activeUsers}</p>
                      <p className="text-slate-400 text-xs mt-1">Inactive</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-indigo-500/20 rounded-xl">
                  <Users className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-8">
            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
            </div>

            {/* Charts Skeleton */}
            <ChartSkeleton height={400} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton height={350} />
              <ChartSkeleton height={350} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Clock className="w-8 h-8 text-blue-400" />
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">Total Hours</h3>
                <p className="text-4xl font-bold text-white">{totalHours.toFixed(0)}</p>
                <p className="text-slate-400 text-sm mt-2">Across all projects</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Calendar className="w-8 h-8 text-purple-400" />
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">Total Entries</h3>
                <p className="text-4xl font-bold text-white">{totalEntries}</p>
                <p className="text-slate-400 text-sm mt-2">Time entries logged</p>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">Active Clients</h3>
                <p className="text-4xl font-bold text-white">{totalClients}</p>
                <p className="text-slate-400 text-sm mt-2">With logged hours</p>
              </div>

              <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-orange-400" />
                  </div>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">Avg Hours/Entry</h3>
                <p className="text-4xl font-bold text-white">{avgHoursPerEntry.toFixed(1)}</p>
                <p className="text-slate-400 text-sm mt-2">Per time entry</p>
              </div>
            </div>

            {/* Hours Summary Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Hours Summary by Month</h2>
                </div>
                {refreshing && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Updating...</span>
                  </div>
                )}
              </div>
              {hoursSummary.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={hoursSummary.map(item => ({
                    month: item._id?.month || 'Unknown',
                    hours: item.totalHours || 0,
                    entries: item.count || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Hours" />
                    <Bar dataKey="entries" fill="#10b981" radius={[8, 8, 0, 0]} name="Entries" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="bg-white/5 rounded-xl h-64 flex items-center justify-center border border-white/10">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-300">No hours data available</p>
                    <p className="text-slate-500 text-sm mt-1">Data will appear here when time entries are logged</p>
                  </div>
                </div>
              )}
            </div>

            {/* Client Activity Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <PieChart className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Client Distribution</h2>
                  </div>
                  {refreshing && <Loader2 size={16} className="text-purple-400 animate-spin" />}
                </div>
                {clientActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsPie>
                      <Pie
                        data={clientActivity.map(item => ({
                          name: item.clientName || 'Unassigned',
                          value: item.totalHours || 0
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {clientActivity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-300">No client activity data</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bar Chart */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Client Hours Breakdown</h2>
                  </div>
                  {refreshing && <Loader2 size={16} className="text-green-400 animate-spin" />}
                </div>
                {clientActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={clientActivity.map(item => ({
                      client: item.clientName || 'Unassigned',
                      hours: item.totalHours || 0,
                      entries: item.count || 0,
                      avg: item.count ? ((item.totalHours || 0) / item.count).toFixed(1) : '0.0'
                    }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis dataKey="client" type="category" stroke="#94a3b8" style={{ fontSize: '12px' }} width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="hours" fill="#3b82f6" radius={[0, 8, 8, 0]} name="Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-300">No client hours data</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
