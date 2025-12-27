import express from 'express';
import { body, validationResult } from 'express-validator';
import HoursLog from '../models/HoursLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get user's hours logs
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;
    let query = { userId: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const logs = await HoursLog.find(query)
      .populate('clientId', 'name')
      .limit(limit * 1)
      .skip(skip)
      .sort({ date: -1 });

    const total = await HoursLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get hours for specific date
router.get('/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const log = await HoursLog.findOne({
      userId: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('clientId', 'name');

    if (!log) {
      return res.status(404).json({ message: 'No hours logged for this date' });
    }

    res.status(200).json({
      success: true,
      log
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create hours log
router.post('/', protect, [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('hoursWorked').isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('taskDescription').optional().trim(),
  body('category').optional().isIn(['Development', 'Testing', 'Meeting', 'Documentation', 'Support', 'Other']),
  body('clientId').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { date, hoursWorked, taskDescription, category, clientId } = req.body;
    const logDate = new Date(date);
    const startOfDay = new Date(logDate);
    const endOfDay = new Date(logDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check for duplicate entry
    const existingLog = await HoursLog.findOne({
      userId: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingLog) {
      return res.status(400).json({ message: 'Hours already logged for this date' });
    }

    const log = new HoursLog({
      userId: req.user.id,
      clientId,
      date: logDate,
      hoursWorked,
      taskDescription,
      category
    });

    await log.save();
    await log.populate('clientId', 'name');

    res.status(201).json({
      success: true,
      message: 'Hours logged successfully',
      log
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update hours log
router.put('/:id', protect, [
  body('hoursWorked').optional().isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('taskDescription').optional().trim(),
  body('category').optional().isIn(['Development', 'Testing', 'Meeting', 'Documentation', 'Support', 'Other'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let log = await HoursLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: 'Hours log not found' });
    }

    // Ensure user can only update their own logs
    if (log.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this log' });
    }

    log = await HoursLog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('clientId', 'name');

    res.status(200).json({
      success: true,
      message: 'Hours log updated successfully',
      log
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete hours log
router.delete('/:id', protect, async (req, res) => {
  try {
    const log = await HoursLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: 'Hours log not found' });
    }

    // Ensure user can only delete their own logs
    if (log.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this log' });
    }

    await HoursLog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Hours log deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
