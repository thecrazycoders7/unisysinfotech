import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

/**
 * EMPLOYEE & EMPLOYER: Submit or update hours for a specific date
 * POST /api/timecards
 */
router.post('/', protect, authorize('employee', 'employer'), [
  body('date').isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('hoursWorked').isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('notes').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { date, hoursWorked, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('id, role, employer_id')
      .eq('id', userId)
      .single();
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For employees, check if they have an employer
    if (userRole === 'employee' && !user.employer_id) {
      return res.status(400).json({ message: 'Employee must be assigned to an employer' });
    }

    // Normalize date (Supabase expects date as string YYYY-MM-DD)
    const normalizedDate = new Date(date).toISOString().split('T')[0];

    // Check if entry already exists for this date
    const { data: existingEntry } = await supabase
      .from('time_cards')
      .select('*')
      .eq('employee_id', userId)
      .eq('date', normalizedDate)
      .maybeSingle();

    if (existingEntry) {
      // Check if entry is locked
      if (existingEntry.is_locked) {
        return res.status(403).json({ message: 'This time entry is locked and cannot be modified' });
      }

      // Update existing entry
      const { data: timeCard, error } = await supabase
        .from('time_cards')
        .update({
          hours_worked: hoursWorked,
          notes: notes || existingEntry.notes || ''
        })
        .eq('id', existingEntry.id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Time entry updated successfully',
        timeCard
      });
    }

    // Create new entry
    const employerId = userRole === 'employer' ? userId : user.employer_id;
    
    const { data: timeCard, error } = await supabase
      .from('time_cards')
      .insert({
        employee_id: userId,
        employer_id: employerId,
        date: normalizedDate,
        hours_worked: hoursWorked,
        notes: notes || ''
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Time entry created successfully',
      timeCard
    });
  } catch (error) {
    console.error('Error creating/updating timecard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYEE & EMPLOYER: Get own time entries
 * GET /api/timecards/my-entries
 */
router.get('/my-entries', protect, authorize('employee', 'employer'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const employeeId = req.user.id;

    let query = supabase
      .from('time_cards')
      .select('*')
      .eq('employee_id', employeeId);

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    query = query.order('date', { ascending: false });

    const { data: timeCards, error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: (timeCards || []).length,
      timeCards: timeCards || []
    });
  } catch (error) {
    console.error('Error fetching timecards:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYEE: Delete own time entry (if not locked)
 * DELETE /api/timecards/:id
 */
router.delete('/:id', protect, authorize('employee'), async (req, res) => {
  try {
    const { data: timeCard } = await supabase
      .from('time_cards')
      .select('employee_id, is_locked')
      .eq('id', req.params.id)
      .single();

    if (!timeCard) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    // Ensure employee owns this entry
    if (timeCard.employee_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    // Check if locked
    if (timeCard.is_locked) {
      return res.status(403).json({ message: 'This time entry is locked and cannot be deleted' });
    }

    const { error } = await supabase
      .from('time_cards')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Time entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting timecard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYER: Get all time entries for employees under them
 * GET /api/timecards/employer/entries
 */
router.get('/employer/entries', protect, authorize('employer'), async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const employerId = req.user.id;

    let query = supabase
      .from('time_cards')
      .select('*')
      .eq('employer_id', employerId);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    query = query.order('date', { ascending: false });

    const { data: timeCards, error } = await query;

    if (error) throw error;

    // Fetch employee info separately
    const timeCardsWithEmployees = await Promise.all(
      (timeCards || []).map(async (card) => {
        if (card.employee_id) {
          const { data: employee } = await supabase
            .from('users')
            .select('id, name, email, designation')
            .eq('id', card.employee_id)
            .single();
          return { ...card, employee: employee || null };
        }
        return card;
      })
    );

    res.status(200).json({
      success: true,
      count: timeCardsWithEmployees.length,
      timeCards: timeCardsWithEmployees
    });
  } catch (error) {
    console.error('Error fetching employer timecards:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYER: Get list of employees under them
 * GET /api/timecards/employer/employees
 */
router.get('/employer/employees', protect, authorize('employer'), async (req, res) => {
  try {
    const employerId = req.user.id;

    const { data: employees, error } = await supabase
      .from('users')
      .select('id, name, email, designation')
      .eq('employer_id', employerId)
      .eq('role', 'employee')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform to match expected format
    const formattedEmployees = (employees || []).map(emp => ({
      _id: emp.id,
      id: emp.id,
      name: emp.name,
      email: emp.email,
      designation: emp.designation
    }));

    res.status(200).json({
      success: true,
      count: formattedEmployees.length,
      employees: formattedEmployees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYER: Get weekly summary for all employees
 * GET /api/timecards/employer/weekly-summary
 */
router.get('/employer/weekly-summary', protect, authorize('employer'), async (req, res) => {
  try {
    const { startDate } = req.query;
    const employerId = req.user.id;

    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }

    // Calculate week range (7 days from startDate)
    const weekStart = new Date(startDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const { data: timeCards, error } = await supabase
      .from('time_cards')
      .select('*')
      .eq('employer_id', employerId)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])
      .order('employee_id', { ascending: true })
      .order('date', { ascending: true });

    if (error) throw error;

    // Fetch employee info for all unique employees
    const uniqueEmployeeIds = [...new Set((timeCards || []).map(c => c.employee_id))];
    const employeeMap = {};
    await Promise.all(
      uniqueEmployeeIds.map(async (empId) => {
        const { data: employee } = await supabase
          .from('users')
          .select('id, name, email, designation')
          .eq('id', empId)
          .single();
        if (employee) employeeMap[empId] = employee;
      })
    );

    // Group by employee
    const summary = {};
    (timeCards || []).forEach(card => {
      const empId = card.employee_id;
      if (!summary[empId]) {
        const emp = employeeMap[empId] || {};
        summary[empId] = {
          employee: {
            id: emp.id || empId,
            name: emp.name || 'Unknown',
            email: emp.email || '',
            designation: emp.designation || ''
          },
          entries: [],
          totalHours: 0
        };
      }
      summary[empId].entries.push({
        date: card.date,
        hoursWorked: parseFloat(card.hours_worked),
        notes: card.notes
      });
      summary[empId].totalHours += parseFloat(card.hours_worked || 0);
    });

    // Round total hours
    Object.values(summary).forEach(emp => {
      emp.totalHours = Math.round(emp.totalHours * 10) / 10;
    });

    res.status(200).json({
      success: true,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      summary: Object.values(summary)
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN: Get all time entries across the system
 * GET /api/timecards/admin/all-entries
 */
router.get('/admin/all-entries', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate, employeeId, employerId } = req.query;

    let query = supabase
      .from('time_cards')
      .select('*');

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (employerId) {
      query = query.eq('employer_id', employerId);
    }

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    query = query.order('date', { ascending: false });

    const { data: timeCards, error } = await query;

    if (error) throw error;

    // Fetch employee and employer info separately
    const uniqueEmployeeIds = [...new Set((timeCards || []).map(c => c.employee_id).filter(Boolean))];
    const uniqueEmployerIds = [...new Set((timeCards || []).map(c => c.employer_id).filter(Boolean))];
    
    const employeeMap = {};
    const employerMap = {};
    
    await Promise.all([
      ...uniqueEmployeeIds.map(async (empId) => {
        const { data: employee } = await supabase
          .from('users')
          .select('id, name, email, designation, department')
          .eq('id', empId)
          .single();
        if (employee) employeeMap[empId] = employee;
      }),
      ...uniqueEmployerIds.map(async (empId) => {
        const { data: employer } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', empId)
          .single();
        if (employer) employerMap[empId] = employer;
      })
    ]);

    const timeCardsWithRelations = (timeCards || []).map(card => ({
      ...card,
      employee: employeeMap[card.employee_id] || null,
      employer: employerMap[card.employer_id] || null
    }));

    // Calculate total hours
    const totalHours = timeCardsWithRelations.reduce((sum, card) => sum + parseFloat(card.hours_worked || 0), 0);

    res.status(200).json({
      success: true,
      count: timeCardsWithRelations.length,
      totalHours: Math.round(totalHours * 10) / 10,
      timeCards: timeCardsWithRelations
    });
  } catch (error) {
    console.error('Error fetching admin timecards:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN: Get timecard statistics and summaries
 * GET /api/timecards/admin/stats
 */
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = supabase.from('time_cards').select('*');

    if (startDate) {
      query = query.gte('date', new Date(startDate).toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', new Date(endDate).toISOString().split('T')[0]);
    }

    const { data: timeCards, error } = await query;

    if (error) throw error;

    // Calculate statistics in JavaScript
    const totalHours = (timeCards || []).reduce((sum, card) => sum + parseFloat(card.hours_worked || 0), 0);
    const uniqueEmployees = new Set((timeCards || []).map(card => card.employee_id)).size;
    const averageHoursPerDay = (timeCards || []).length > 0 ? totalHours / (timeCards || []).length : 0;

    // Group by day of week
    const hoursByDay = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    (timeCards || []).forEach(card => {
      const dayIndex = new Date(card.date).getDay();
      const dayName = dayNames[dayIndex];
      hoursByDay[dayName] += parseFloat(card.hours_worked || 0);
    });

    res.status(200).json({
      success: true,
      stats: {
        totalHours: Math.round(totalHours * 10) / 10,
        totalEntries: (timeCards || []).length,
        uniqueEmployees,
        averageHoursPerDay: Math.round(averageHoursPerDay * 10) / 10,
        hoursByDay
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
