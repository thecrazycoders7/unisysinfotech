import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

// Get hours summary (admin only)
router.get('/hours-summary', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase.from('time_cards').select('date, hours_worked');

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    const { data: timeCards, error } = await query;

    if (error) throw error;

    // Group by month in JavaScript
    const monthlySummary = {};
    (timeCards || []).forEach(card => {
      const date = new Date(card.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = {
          month: monthKey,
          totalHours: 0,
          count: 0
        };
      }
      
      monthlySummary[monthKey].totalHours += parseFloat(card.hours_worked || 0);
      monthlySummary[monthKey].count += 1;
    });

    // Convert to array and sort
    const summary = Object.values(monthlySummary)
      .map(item => ({
        _id: { month: item.month },
        totalHours: Math.round(item.totalHours * 10) / 10,
        count: item.count
      }))
      .sort((a, b) => b._id.month.localeCompare(a._id.month));

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error fetching hours summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get client activity report (admin only)
router.get('/client-activity', protect, authorize('admin'), async (req, res) => {
  try {
    // Get all timecards grouped by employee
    const { data: timeCards, error } = await supabase
      .from('time_cards')
      .select('employee_id, hours_worked');

    if (error) throw error;

    // Group by employee in JavaScript
    const activityMap = {};
    (timeCards || []).forEach(card => {
      const empId = card.employee_id;
      if (!activityMap[empId]) {
        activityMap[empId] = {
          totalHours: 0,
          count: 0
        };
      }
      activityMap[empId].totalHours += parseFloat(card.hours_worked || 0);
      activityMap[empId].count += 1;
    });

    // Get employee details and build report
    const report = await Promise.all(
      Object.entries(activityMap).map(async ([employeeId, stats]) => {
        const { data: employee } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', employeeId)
          .single();

        return {
          employeeId: employeeId,
          clientName: employee?.name || 'Unknown Employee',
          totalHours: Math.round(stats.totalHours * 10) / 10,
          count: stats.count
        };
      })
    );

    // Sort by total hours descending
    report.sort((a, b) => b.totalHours - a.totalHours);

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error fetching client activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's weekly hours summary
router.get('/my-weekly-summary', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: timeCards, error } = await supabase
      .from('time_cards')
      .select('*')
      .eq('employee_id', req.user.id)
      .gte('date', startOfWeek.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    const totalHours = (timeCards || []).reduce((sum, card) => sum + parseFloat(card.hours_worked || 0), 0);

    res.status(200).json({
      success: true,
      totalHours: Math.round(totalHours * 10) / 10,
      entries: (timeCards || []).length,
      timeCards: timeCards || []
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's monthly hours summary
router.get('/my-monthly-summary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const today = new Date();
    const currentMonth = month ? parseInt(month) - 1 : today.getMonth();
    const currentYear = year ? parseInt(year) : today.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const { data: timeCards, error } = await supabase
      .from('time_cards')
      .select('*')
      .eq('employee_id', req.user.id)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    const totalHours = (timeCards || []).reduce((sum, card) => sum + parseFloat(card.hours_worked || 0), 0);

    res.status(200).json({
      success: true,
      month: currentMonth + 1,
      year: currentYear,
      totalHours: Math.round(totalHours * 10) / 10,
      entries: (timeCards || []).length,
      timeCards: timeCards || []
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
