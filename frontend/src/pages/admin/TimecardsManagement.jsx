import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/index.js';
import { timeCardAPI, adminAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Clock, Search, Filter, Calendar, User, Users, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export const TimecardsManagement = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [timecards, setTimecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalHours: 0, totalEntries: 0, uniqueEmployees: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchTimecards();
  }, [selectedMonth]);

  const fetchTimecards = async () => {
    setLoading(true);
    try {
      // Calculate date range for selected month
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const [timecardsRes, statsRes] = await Promise.all([
        timeCardAPI.getAllEntries({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }),
        timeCardAPI.getStats({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      ]);

      setTimecards(timecardsRes.data.timeCards || []);
      setStats({
        totalHours: timecardsRes.data.totalHours || 0,
        totalEntries: timecardsRes.data.count || 0,
        uniqueEmployees: statsRes.data.stats?.uniqueEmployees || 0,
        hoursByDay: statsRes.data.stats?.hoursByDay || {}
      });
    } catch (error) {
      console.error('Error fetching timecards:', error);
      toast.error('Failed to fetch timecards');
    } finally {
      setLoading(false);
    }
  };

  // Filter timecards by search term
  const filteredTimecards = timecards.filter(tc => {
    const employeeName = tc.employee?.name?.toLowerCase() || '';
    const employeeEmail = tc.employee?.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return employeeName.includes(search) || employeeEmail.includes(search);
  });

  // Pagination
  const totalPages = Math.ceil(filteredTimecards.length / itemsPerPage);
  const paginatedTimecards = filteredTimecards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Employee Name', 'Employee Email', 'Hours Worked', 'Notes', 'Status'];
    const csvData = filteredTimecards.map(tc => [
      new Date(tc.date).toLocaleDateString(),
      tc.employee?.name || 'Unknown',
      tc.employee?.email || 'N/A',
      tc.hoursWorked,
      tc.notes || '',
      tc.isLocked ? 'Locked' : 'Open'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `timecards_${selectedMonth}.csv`;
    link.click();
    toast.success('Timecards exported successfully!');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthName = () => {
    const [year, month] = selectedMonth.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Timecard Management</h1>
          <p className="text-slate-300">View and manage all employee timecards</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Hours</p>
                <p className="text-2xl font-bold text-white">{stats.totalHours?.toFixed(1) || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Entries</p>
                <p className="text-2xl font-bold text-white">{stats.totalEntries || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Employees</p>
                <p className="text-2xl font-bold text-white">{stats.uniqueEmployees || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Avg Hours/Entry</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalEntries > 0 ? (stats.totalHours / stats.totalEntries).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center flex-wrap">
              {/* Month Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-800/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-800/50 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchTimecards}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Month Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Timecards for {getMonthName()}
          </h2>
          <span className="text-slate-400">
            Showing {paginatedTimecards.length} of {filteredTimecards.length} entries
          </span>
        </div>

        {/* Timecards Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : paginatedTimecards.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No timecard entries found</p>
              <p className="text-slate-500 text-sm mt-2">
                {searchTerm ? 'Try adjusting your search' : 'No entries for the selected month'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left text-slate-300 font-semibold px-6 py-4">Date</th>
                      <th className="text-left text-slate-300 font-semibold px-6 py-4">Employee</th>
                      <th className="text-left text-slate-300 font-semibold px-6 py-4">Department</th>
                      <th className="text-center text-slate-300 font-semibold px-6 py-4">Hours</th>
                      <th className="text-left text-slate-300 font-semibold px-6 py-4">Notes</th>
                      <th className="text-center text-slate-300 font-semibold px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {paginatedTimecards.map((tc) => (
                      <tr key={tc.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-white">{formatDate(tc.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{tc.employee?.name || 'Unknown'}</p>
                              <p className="text-slate-400 text-sm">{tc.employee?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300">{tc.employee?.department || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1 rounded-full font-bold ${
                            tc.hoursWorked >= 8 
                              ? 'bg-green-600/30 text-green-400' 
                              : tc.hoursWorked >= 4 
                                ? 'bg-yellow-600/30 text-yellow-400'
                                : 'bg-slate-600/30 text-slate-300'
                          }`}>
                            {tc.hoursWorked}h
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300 truncate max-w-[200px] block">
                            {tc.notes || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            tc.isLocked 
                              ? 'bg-red-600/30 text-red-400' 
                              : 'bg-blue-600/30 text-blue-400'
                          }`}>
                            {tc.isLocked ? 'Locked' : 'Open'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
                  <p className="text-slate-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

