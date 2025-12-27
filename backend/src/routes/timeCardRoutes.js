import express from 'express';
import { body, validationResult } from 'express-validator';
import TimeCard from '../models/TimeCard.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * EMPLOYEE: Submit or update hours for a specific date
 * POST /api/timecards
 * Employee can only create/update their own time entries
 */
router.post('/', protect, authorize('employee'), [
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
    const employeeId = req.user.id;

    // Get employee details to find their employer
    const employee = await User.findById(employeeId);
    if (!employee || !employee.employerId) {
      return res.status(400).json({ message: 'Employee must be assigned to an employer' });
    }

    // Normalize date to start of day in UTC
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Check if entry already exists for this date
    let timeCard = await TimeCard.findOne({
      employeeId,
      date: normalizedDate
    });

    if (timeCard) {
      // Check if entry is locked
      if (timeCard.isLocked) {
        return res.status(403).json({ message: 'This time entry is locked and cannot be modified' });
      }

      // Update existing entry
      timeCard.hoursWorked = hoursWorked;
      timeCard.notes = notes || timeCard.notes;
      await timeCard.save();

      return res.status(200).json({
        success: true,
        message: 'Time entry updated successfully',
        timeCard
      });
    }

    // Create new entry
    timeCard = new TimeCard({
      employeeId,
      employerId: employee.employerId,
      date: normalizedDate,
      hoursWorked,
      notes: notes || ''
    });

    await timeCard.save();

    res.status(201).json({
      success: true,
      message: 'Time entry created successfully',
      timeCard
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYEE: Get own time entries
 * GET /api/timecards/my-entries
 * Query params: startDate, endDate
 */
router.get('/my-entries', protect, authorize('employee'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const employeeId = req.user.id;

    const filter = { employeeId };

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const timeCards = await TimeCard.find(filter)
      .sort({ date: -1 })
      .populate('employerId', 'name email');

    res.status(200).json({
      success: true,
      count: timeCards.length,
      timeCards
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYEE: Delete own time entry (if not locked)
 * DELETE /api/timecards/:id
 */
router.delete('/:id', protect, authorize('employee'), async (req, res) => {
  try {
    const timeCard = await TimeCard.findById(req.params.id);

    if (!timeCard) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    // Ensure employee owns this entry
    if (timeCard.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this entry' });
    }

    // Check if locked
    if (timeCard.isLocked) {
      return res.status(403).json({ message: 'This time entry is locked and cannot be deleted' });
    }

    await timeCard.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Time entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYER: Get all time entries for employees under them
 * GET /api/timecards/employer/entries
 * Query params: startDate, endDate, employeeId
 */
router.get('/employer/entries', protect, authorize('employer'), async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const employerId = req.user.id;

    const filter = { employerId };

    // Filter by specific employee if provided
    if (employeeId) {
      filter.employeeId = employeeId;
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const timeCards = await TimeCard.find(filter)
      .sort({ date: -1 })
      .populate('employeeId', 'name email designation');

    res.status(200).json({
      success: true,
      count: timeCards.length,
      timeCards
    });
  } catch (error) {
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

    const employees = await User.find({ 
      employerId, 
      role: 'employee',
      isActive: true 
    })
      .select('_id name email designation')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * EMPLOYER: Get weekly summary for all employees
 * GET /api/timecards/employer/weekly-summary
 * Query params: startDate (Monday of the week)
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

    const timeCards = await TimeCard.find({
      employerId,
      date: { $gte: weekStart, $lte: weekEnd }
    })
      .populate('employeeId', 'name email designation')
      .sort({ employeeId: 1, date: 1 });

    // Group by employee
    const summary = {};
    timeCards.forEach(card => {
      const empId = card.employeeId._id.toString();
      if (!summary[empId]) {
        summary[empId] = {
          employee: {
            id: card.employeeId._id,
            name: card.employeeId.name,
            email: card.employeeId.email,
            designation: card.employeeId.designation
          },
          entries: [],
          totalHours: 0
        };
      }
      summary[empId].entries.push({
        date: card.date,
        hoursWorked: card.hoursWorked,
        notes: card.notes
      });
      summary[empId].totalHours += card.hoursWorked;
    });

    // Round total hours to 1 decimal place for consistency
    Object.values(summary).forEach(emp => {
      emp.totalHours = Math.round(emp.totalHours * 10) / 10;
    });

    res.status(200).json({
      success: true,
      weekStart,
      weekEnd,
      summary: Object.values(summary)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
