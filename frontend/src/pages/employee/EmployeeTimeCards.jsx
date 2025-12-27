import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/index.js';
import { timeCardAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Calendar, Clock, Save, Trash2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

/**
 * Employee TimeCard Page
 * Calendar-based interface for logging daily working hours
 * Features:
 * - Monthly calendar view
 * - Click date to add/edit hours
 * - View existing entries
 * - Cannot edit locked entries
 */
export const EmployeeTimeCards = () => {
  const navigate = useNavigate();
  const isDark = useThemeStore((state) => state.isDark);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeCards, setTimeCards] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoursWorked, setHoursWorked] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
      
      setTimeCards(response.data.timeCards);
    } catch (error) {
      toast.error('Failed to fetch time entries');
    }
  };

  const handleSubmitHours = async (e) => {
    e.preventDefault();
    if (!selectedDate || !hoursWorked) return;

    setLoading(true);
    try {
      await timeCardAPI.submitHours({
        date: selectedDate.toISOString().split('T')[0],
        hoursWorked: parseFloat(hoursWorked),
        notes
      });
      
      toast.success('Hours submitted successfully!');
      setShowModal(false);
      setHoursWorked('');
      setNotes('');
      fetchTimeCards();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit hours');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    
    // Check if entry exists for this date
    const existing = timeCards.find(tc => {
      const tcDate = new Date(tc.date);
      return tcDate.toDateString() === date.toDateString();
    });
    
    if (existing) {
      if (existing.isLocked) {
        toast.warning('This entry is locked and cannot be edited');
        return;
      }
      setHoursWorked(existing.hoursWorked.toString());
      setNotes(existing.notes || '');
    } else {
      setHoursWorked('');
      setNotes('');
    }
    
    setShowModal(true);
  };

  // Calendar generation
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
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

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/role-selection')}
            className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Role Selection</span>
          </button>
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            My TimeCards
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Click on a date to log your working hours
          </p>
        </div>

        {/* Calendar Controls */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg mb-4`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
            >
              <ChevronLeft size={20} className={isDark ? 'text-white' : 'text-slate-900'} />
            </button>
            
            <h2 className={`text-lg md:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => changeMonth(1)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
            >
              <ChevronRight size={20} className={isDark ? 'text-white' : 'text-slate-900'} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className={`text-center text-xs font-semibold py-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {day.slice(0, 3)}
              </div>
            ))}
            
            {/* Calendar days */}
            {getDaysInMonth().map((date, idx) => {
              const entry = getHoursForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={idx}
                  onClick={() => date && handleDateClick(date)}
                  disabled={!date}
                  className={`
                    aspect-square p-1 md:p-2 rounded-lg transition-all relative text-center
                    ${!date ? 'invisible' : ''}
                    ${isToday ? 'ring-2 ring-indigo-600' : ''}
                    ${entry ? (isDark ? 'bg-indigo-900/50 hover:bg-indigo-900/70' : 'bg-indigo-100 hover:bg-indigo-200') : (isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200')}
                    ${entry?.isLocked ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  {date && (
                    <>
                      <div className={`text-xs md:text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {date.getDate()}
                      </div>
                      {entry && (
                        <div className="text-[10px] md:text-xs font-bold text-indigo-600">
                          {entry.hoursWorked}h
                        </div>
                      )}
                      {entry?.isLocked && (
                        <div className="absolute top-0 right-0 text-xs">
                          🔒
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-4 md:p-6 shadow-lg`}>
          <h3 className={`text-lg md:text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Monthly Summary
          </h3>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className={`p-3 md:p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Hours</div>
              <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {timeCards.reduce((sum, tc) => sum + tc.hoursWorked, 0).toFixed(1)}
              </div>
            </div>
            <div className={`p-3 md:p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Days Worked</div>
              <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {timeCards.length}
              </div>
            </div>
            <div className={`p-3 md:p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Avg Hours/Day</div>
              <div className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {timeCards.length > 0 ? (timeCards.reduce((sum, tc) => sum + tc.hoursWorked, 0) / timeCards.length).toFixed(1) : '0.0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hours Entry Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Log Hours - {selectedDate.toLocaleDateString()}
            </h3>
            
            <form onSubmit={handleSubmitHours} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                  Hours Worked *
                </label>
                  <input
                  type="number"
                  step="1"
                  min="0"
                  max="24"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  maxLength="500"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  placeholder="Any notes about this day's work..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Hours'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-6 py-2 rounded-lg font-semibold ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
