import express from 'express';
import TimeCard from '../models/TimeCard.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get hours summary (admin only)
router.get('/hours-summary', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const summary = await TimeCard.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } }
          },
          totalHours: { $sum: '$hoursWorked' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': -1 } }
    ]);

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get client activity report (admin only)
router.get('/client-activity', protect, authorize('admin'), async (req, res) => {
  try {
    // Get all timecards and group by employee
    const activity = await TimeCard.aggregate([
      {
        $group: {
          _id: '$employeeId',
          totalHours: { $sum: '$hoursWorked' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalHours: -1 } }
    ]);

    // Populate employee names
    const report = await Promise.all(
      activity.map(async (item) => {
        if (item._id) {
          const employee = await User.findById(item._id).select('name email');
          return {
            employeeId: item._id,
            clientName: employee?.name || 'Unknown Employee',
            totalHours: item.totalHours,
            count: item.count
          };
        }
        return {
          clientName: 'Unassigned',
          totalHours: item.totalHours,
          count: item.count
        };
      })
    );

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
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

    const timeCards = await TimeCard.find({
      employeeId: req.user.id,
      date: { $gte: startOfWeek }
    });

    const totalHours = timeCards.reduce((sum, card) => sum + card.hoursWorked, 0);

    res.status(200).json({
      success: true,
      totalHours: Math.round(totalHours * 10) / 10,
      entries: timeCards.length,
      timeCards
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's monthly hours summary
router.get('/my-monthly-summary', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const today = new Date();
    const currentMonth = month || today.getMonth();
    const currentYear = year || today.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const timeCards = await TimeCard.find({
      employeeId: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    const totalHours = timeCards.reduce((sum, card) => sum + card.hoursWorked, 0);

    res.status(200).json({
      success: true,
      month: currentMonth + 1,
      year: currentYear,
      totalHours: Math.round(totalHours * 10) / 10,
      entries: timeCards.length,
      timeCards
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
