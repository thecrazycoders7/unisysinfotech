import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/index.js';
import { useAuthStore } from '../../store/index.js';
import { timeCardAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Calendar, Users, Clock, ChevronLeft, ChevronRight, BarChart3, ArrowLeft } from 'lucide-react';

/**
 * Employer Dashboard
 * Weekly view of employee timecards
 * Features:
 * - See all employees and their hours
 * - Weekly totals per employee
 * - Daily breakdown
 * - Week navigation
 * - Employee filter
 * - Read-only (cannot edit entries)
 */
export const EmployerDashboard = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [loading, setLoading] = useState(false);

  // Get Monday of current week
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch weekly summary when week changes
  useEffect(() => {
    fetchWeeklySummary();
  }, [currentWeekStart, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const response = await timeCardAPI.getEmployees();
      setEmployees(response.data.employees);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const fetchWeeklySummary = async () => {
    setLoading(true);
    try {
      const startDate = currentWeekStart.toISOString().split('T')[0];
      const response = await timeCardAPI.getWeeklySummary(startDate);
      
      // Filter by selected employee if needed
      let summary = response.data.summary;
      if (selectedEmployee) {
        summary = summary.filter(s => s.employee.id === selectedEmployee);
      }
      
      setWeeklySummary(summary);
    } catch (error) {
      toast.error('Failed to fetch weekly summary');
    } finally {
      setLoading(false);
    }
  };

  const changeWeek = (increment) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (increment * 7));
    setCurrentWeekStart(newDate);
  };

  // Generate week days array
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get hours for specific employee and date
  const getHoursForDate = (employeeData, date) => {
    const entry = employeeData.entries.find(e => {
      const entryDate = new Date(e.date);
      return entryDate.toDateString() === date.toDateString();
    });
    return entry ? entry.hoursWorked : 0;
  };

  const formatDateRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button and Header */}
        <button
          onClick={() => navigate('/role-selection')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 transition text-sm ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Role Selection</span>
        </button>
        
        <div className="mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Employer Dashboard
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            View your employees' weekly timecards
          </p>
        </div>

        {/* Filters and Controls */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-lg mb-6`}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Week Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => changeWeek(-1)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
              >
                <ChevronLeft size={24} className={isDark ? 'text-white' : 'text-slate-900'} />
              </button>
              
              <div className="text-center">
                <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatDateRange()}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Week {(() => {
                    const date = new Date(currentWeekStart);
                    const startOfYear = new Date(date.getFullYear(), 0, 1);
                    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
                    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
                  })()}
                </div>
              </div>
              
              <button
                onClick={() => changeWeek(1)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
              >
                <ChevronRight size={24} className={isDark ? 'text-white' : 'text-slate-900'} />
              </button>
            </div>

            {/* Employee Filter */}
            <div className="flex items-center gap-3">
              <Users size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                <option value="">All Employees</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Weekly Grid */}
        {loading ? (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-12 shadow-lg text-center`}>
            <div className={`text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Loading timecard data...
            </div>
          </div>
        ) : weeklySummary.length === 0 ? (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-12 shadow-lg text-center`}>
            <Users size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            <div className={`text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No timecard entries for this week
            </div>
            <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Employees haven't submitted any hours yet
            </p>
          </div>
        ) : (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-slate-900' : 'bg-slate-100'}>
                  <tr>
                    <th className={`px-6 py-4 text-left font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Employee
                    </th>
                    {weekDays.map((day, idx) => (
                      <th key={idx} className={`px-4 py-4 text-center font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <div>{dayNames[idx]}</div>
                        <div className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {day.getMonth() + 1}/{day.getDate()}
                        </div>
                      </th>
                    ))}
                    <th className={`px-6 py-4 text-center font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
                  {weeklySummary.map((empData, empIdx) => (
                    <tr key={empIdx} className={isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}>
                      <td className={`px-6 py-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <div className="font-semibold">{empData.employee.name}</div>
                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {empData.employee.designation || 'Employee'}
                        </div>
                      </td>
                      {weekDays.map((day, dayIdx) => {
                        const hours = getHoursForDate(empData, day);
                        return (
                          <td key={dayIdx} className={`px-4 py-4 text-center`}>
                            {hours > 0 ? (
                              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold ${isDark ? 'bg-indigo-900/50 text-white' : 'bg-indigo-100 text-indigo-900'}`}>
                                {hours}
                              </div>
                            ) : (
                              <div className={`${isDark ? 'text-slate-600' : 'text-slate-400'}`}>-</div>
                            )}
                          </td>
                        );
                      })}
                      <td className={`px-6 py-4 text-center`}>
                        <div className={`inline-flex items-center justify-center w-16 h-12 rounded-lg font-bold ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`}>
                          {empData.totalHours}h
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {weeklySummary.length > 0 && (() => {
          const totalHours = weeklySummary.reduce((sum, emp) => sum + emp.totalHours, 0);
          const avgHours = totalHours / weeklySummary.length;
          
          return (
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={24} className="text-indigo-600" />
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Total Hours This Week
                  </div>
                </div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {totalHours.toFixed(1)}
                </div>
              </div>

              <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <Users size={24} className="text-blue-600" />
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Active Employees
                  </div>
                </div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklySummary.length}
                </div>
              </div>

              <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 size={24} className="text-green-600" />
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Avg Hours/Employee
                  </div>
                </div>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {avgHours.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
