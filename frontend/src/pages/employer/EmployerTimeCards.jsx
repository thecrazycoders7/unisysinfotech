import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore, useAuthStore } from '../../store/index.js';
import { timeCardAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Calendar, Clock, Save, Trash2, ChevronLeft, ChevronRight, ArrowLeft, LogOut, Home, Lock } from 'lucide-react';

/**
 * Employer TimeCard Page
 * Calendar-based interface for logging daily working hours
 * Similar to employee timecard but for employers
 */
export const EmployerTimeCards = () => {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const { logout, user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeCards, setTimeCards] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoursWorked, setHoursWorked] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch time entries for current month
  useEffect(() => {
    fetchTimeCards();
  }, [currentDate]);

  const fetchTimeCards = async () => {
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await timeCardAPI.getMyEntries({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      const cards = response.data.timeCards || [];
      setTimeCards(cards);
    } catch (error) {
      console.error('Fetch timecards error:', error);
      toast.error('Failed to fetch time entries');
    }
  };

  const handleSubmitHours = async (e) => {
    e.preventDefault();
    if (!selectedDate || !hoursWorked) {
      toast.error('Please enter hours worked');
      return;
    }

    const hours = parseFloat(hoursWorked);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      toast.error('Hours must be between 0 and 24');
      return;
    }

    setLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const payload = {
        date: formattedDate,
        hoursWorked: hours,
        notes: ''
      };
      
      await timeCardAPI.submitHours(payload);
      
      toast.success(editingEntryId ? 'Hours updated successfully!' : 'Hours submitted successfully!');
      setShowModal(false);
      setHoursWorked('');
      setEditingEntryId(null);
      await fetchTimeCards();
    } catch (error) {
      console.error('Submit hours error:', error);
      const errorMsg = error.response?.data?.message || 
                       error.response?.data?.errors?.[0]?.msg ||
                       error.message ||
                       'Failed to submit hours';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    setDeleting(true);
    try {
      await timeCardAPI.deleteEntry(entryId);
      toast.success('Time entry deleted successfully');
      await fetchTimeCards();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete entry';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    
    const existingEntry = timeCards.find(tc => {
      const tcDate = new Date(tc.date);
      return tcDate.toDateString() === date.toDateString();
    });

    if (existingEntry) {
      if (existingEntry.isLocked) {
        toast.warning('This entry is locked and cannot be edited');
        return;
      }
      setHoursWorked(existingEntry.hoursWorked.toString());
      setEditingEntryId(existingEntry._id);
    } else {
      setHoursWorked('');
      setEditingEntryId(null);
    }
    
    setShowModal(true);
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getHoursForDate = (date) => {
    if (!date) return null;
    const entry = timeCards.find(tc => {
      const tcDate = new Date(tc.date);
      return tcDate.toDateString() === date.toDateString();
    });
    return entry;
  };

  const getTotalHours = () => {
    return timeCards.reduce((sum, tc) => sum + (tc.hoursWorked || 0), 0);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d35] to-[#0a1628] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/employer/dashboard')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors border border-blue-500/30 text-sm"
              >
                <ArrowLeft size={18} />
                <span className="font-medium hidden sm:inline">Back to Dashboard</span>
                <span className="font-medium sm:hidden">Back</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors border border-blue-500/30 text-sm"
              >
                <Home size={18} />
                <span className="font-medium">Home</span>
              </button>
              <button
                onClick={() => navigate('/employer/change-password')}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors border border-purple-500/30 text-sm"
              >
                <Lock size={18} />
                <span className="font-medium hidden sm:inline">Change Password</span>
                <span className="font-medium sm:hidden">Password</span>
              </button>
            </div>
            <div className="flex items-center justify-between lg:justify-end gap-4">
              <div className="text-left lg:text-right">
                <div className="text-xs md:text-sm text-slate-400">Welcome back,</div>
                <div className="font-semibold text-sm md:text-base">{user?.name || 'Manager'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors border border-red-500/30 text-sm"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            My Time Cards
          </h1>
          <p className="text-slate-400">
            Track your working hours
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-blue-400" />
              <div className="text-sm text-slate-400">Total Hours This Month</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {getTotalHours().toFixed(1)}
            </div>
          </div>

          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} className="text-blue-400" />
              <div className="text-sm text-slate-400">Days Logged</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {timeCards.length}
            </div>
          </div>

          <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-blue-400" />
              <div className="text-sm text-slate-400">Avg Hours/Day</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {timeCards.length > 0 ? (getTotalHours() / timeCards.length).toFixed(1) : '0.0'}
            </div>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-[#1a2942]/50 backdrop-blur-sm border border-blue-900/30 rounded-xl shadow-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-slate-900/50 p-6 flex items-center justify-between border-b border-blue-900/30">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
            </div>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg hover:bg-blue-600/20 transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-[10px] font-semibold py-1 text-slate-400">
                  {day.slice(0, 1)}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-12" />;
                }

                const entry = getHoursForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isFuture = date > new Date();

                return (
                  <button
                    key={index}
                    onClick={() => !isFuture && handleDateClick(date)}
                    disabled={isFuture}
                    className={`
                      h-12 p-1 rounded-md transition-all relative text-center
                      ${isFuture ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-600/40 cursor-pointer'}
                      ${isToday ? 'ring-1 ring-blue-500' : ''}
                      ${entry ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-slate-700/50 border border-slate-600/30'}
                    `}
                  >
                    <div className="text-[10px] font-medium text-white">
                      {date.getDate()}
                    </div>
                    {entry && (
                      <div className="text-[9px] font-bold text-blue-400">
                        {entry.hoursWorked}h
                      </div>
                    )}
                    {entry?.isLocked && (
                      <div className="absolute top-0 right-0 text-[8px]">
                        🔒
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal for Adding/Editing Hours */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a2942] border border-blue-900/30 rounded-xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingEntryId ? 'Edit Hours' : 'Log Hours'}
              </h2>
              
              <form onSubmit={handleSubmitHours}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date
                  </label>
                  <div className="text-lg font-semibold text-white">
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hours Worked *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-slate-800 border-blue-900/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="8.0"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : editingEntryId ? 'Update' : 'Save'}
                  </button>
                  
                  {editingEntryId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(editingEntryId)}
                      disabled={deleting}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setHoursWorked('');
                      setEditingEntryId(null);
                    }}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerTimeCards;
