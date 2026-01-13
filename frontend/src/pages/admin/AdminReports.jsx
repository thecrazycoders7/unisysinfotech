import React from 'react';
import { useThemeStore } from '../../store/index.js';
import { reportsAPI, timeCardAPI, adminAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { BarChart3, PieChart, TrendingUp, Users, Clock, Download, Calendar, FileSpreadsheet, FileText } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AdminReports = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [hoursSummary, setHoursSummary] = React.useState([]);
  const [clientActivity, setClientActivity] = React.useState([]);
  const [employeeData, setEmployeeData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('employees'); // 'employees' or 'employers'

  React.useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [hourRes, clientRes, usersRes] = await Promise.all([
        reportsAPI.getHoursSummary(),
        reportsAPI.getClientActivity(),
        adminAPI.getUsers()
      ]);
      setHoursSummary(hourRes.data.summary || []);
      setClientActivity(clientRes.data.report || []);
      
      // Separate employees and employers
      const allUsers = usersRes.data.users || [];
      setEmployeeData(allUsers);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    if (activeTab === 'employers') {
      return employeeData.filter(user => user.role === 'employer');
    }
    return employeeData.filter(user => user.role === 'employee');
  };

  const filteredEmployeeData = getFilteredData();

  // Helper function to convert data to CSV
  const convertToCSV = (data, headers) => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
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

  // Export comprehensive employee/employer report based on active tab
  const exportEmployeeReport = async () => {
    setExporting(true);
    try {
      let timecards = [];
      
      // Try to fetch timecard data - use fallback if it fails
      try {
        const timecardsRes = await timeCardAPI.getAllEntries();
        timecards = timecardsRes.data.timeCards || [];
      } catch (tcError) {
        console.warn('Could not fetch timecards, exporting user list only:', tcError);
        // Continue with empty timecards array
      }

      // Create comprehensive report based on active tab
      const reportData = [];
      const targetRole = activeTab === 'employers' ? 'employer' : 'employee';
      
      if (filteredEmployeeData.length === 0) {
        toast.error(`No ${targetRole} data available to export`);
        return;
      }
      
      filteredEmployeeData.forEach(user => {
        if (user.role === targetRole) {
          // Find employer/manager
          const manager = employeeData.find(u => u._id === user.employerId);
          
          // Get user's timecards
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
            // Include users with no timecards
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

  // Export employee/employer summary (total hours per user) based on active tab
  const exportEmployeeSummary = async () => {
    setExporting(true);
    try {
      let timecards = [];
      const targetRole = activeTab === 'employers' ? 'employer' : 'employee';
      
      // Try to fetch timecard data
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

  // Export client/project report
  const exportClientReport = () => {
    setExporting(true);
    try {
      const reportData = clientActivity.map(item => ({
        'Client/Project': item.clientName || 'Unassigned',
        'Total Hours': item.totalHours.toFixed(2),
        'Number of Entries': item.count,
        'Average Hours per Entry': (item.totalHours / item.count).toFixed(2),
        'Percentage of Total': ((item.totalHours / clientActivity.reduce((sum, c) => sum + c.totalHours, 0)) * 100).toFixed(2) + '%'
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

  // Export monthly hours summary
  const exportMonthlySummary = () => {
    setExporting(true);
    try {
      const reportData = hoursSummary.map(item => ({
        'Month': item._id.month,
        'Total Hours': item.totalHours.toFixed(2),
        'Number of Entries': item.count,
        'Average Hours per Entry': (item.totalHours / item.count).toFixed(2)
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

  // Calculate totals based on active tab
  const getRoleSpecificStats = React.useMemo(() => {
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
  const totalHours = hoursSummary.reduce((sum, item) => sum + item.totalHours, 0);
  const totalEntries = hoursSummary.reduce((sum, item) => sum + item.count, 0);
  const totalClients = clientActivity.length;
  const avgHoursPerEntry = totalEntries > 0 ? totalHours / totalEntries : 0;

  // Get max value for chart scaling
  const maxHours = Math.max(...hoursSummary.map(item => item.totalHours), 0);
  const maxClientHours = Math.max(...clientActivity.map(item => item.totalHours), 0);

  // Custom tooltip for Recharts
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

  // Colors for pie chart
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Reports & Analytics</h1>
              <p className="text-slate-300">View system reports and analytics</p>
            </div>
          </div>
          
          {/* Tabs for Employee/Employer Timecards */}
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
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Export Reports - {activeTab === 'employees' ? 'Employees' : 'Employers'}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={exportEmployeeReport}
                disabled={exporting}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {exporting ? 'Exporting...' : `${activeTab === 'employers' ? 'Employer' : 'Employee'} Details`}
              </button>
              
              <button 
                onClick={exportEmployeeSummary}
                disabled={exporting}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Users className="w-5 h-5" />
                {exporting ? 'Exporting...' : `${activeTab === 'employers' ? 'Employer' : 'Employee'} Summary`}
              </button>
              
              <button 
                onClick={exportClientReport}
                disabled={exporting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 className="w-5 h-5" />
                {exporting ? 'Exporting...' : 'Client Report'}
              </button>
              
              <button 
                onClick={exportMonthlySummary}
                disabled={exporting}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="w-5 h-5" />
                {exporting ? 'Exporting...' : 'Monthly Summary'}
              </button>
            </div>
            <p className="text-slate-400 text-sm mt-4">
              <FileText className="w-4 h-4 inline mr-1" />
              Export comprehensive reports including {activeTab === 'employers' ? 'employer' : 'employee'} hours, projects, managers, and detailed analytics in CSV format.
            </p>
          </div>

          {/* Role-Specific Stats */}
          <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
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
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-slate-400 mt-4">Loading reports...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 shadow-xl">
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

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-xl">
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

              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 shadow-xl">
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

              <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 shadow-xl">
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

            <div className="space-y-8">
            {/* Hours Summary - Interactive Bar Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Hours Summary by Month</h2>
                </div>
              </div>
              {hoursSummary.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={hoursSummary.map(item => ({
                    month: item._id.month,
                    hours: item.totalHours,
                    entries: item.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="entries" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="bg-white/5 rounded-xl h-64 flex items-center justify-center border border-white/10">
                  <p className="text-slate-300">No hours data available</p>
                </div>
              )}
            </div>

            {/* Client Activity - Interactive Charts */}
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
                </div>
                {clientActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsPie>
                      <Pie
                        data={clientActivity.map(item => ({
                          name: item.clientName || 'Unassigned',
                          value: item.totalHours
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
                  <p className="text-center py-8 text-slate-300">No client activity data available</p>
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
                </div>
                {clientActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={clientActivity.map(item => ({
                      client: item.clientName || 'Unassigned',
                      hours: item.totalHours,
                      entries: item.count,
                      avg: (item.totalHours / item.count).toFixed(1)
                    }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis dataKey="client" type="category" stroke="#94a3b8" style={{ fontSize: '12px' }} width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="hours" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-slate-300">No client activity data available</p>
                )}
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};
