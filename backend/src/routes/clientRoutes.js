import express from 'express';
import { body, validationResult } from 'express-validator';
import Client from '../models/Client.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all clients (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, industry } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (industry) {
      query.industry = industry;
    }

    const skip = (page - 1) * limit;
    const clients = await Client.find(query)
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Client.countDocuments(query);

    res.status(200).json({
      success: true,
      count: clients.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      clients
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single client (admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(200).json({
      success: true,
      client
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create client (admin only)
router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Client name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('industry').trim().notEmpty().withMessage('Industry is required'),
  body('contactPerson').trim().notEmpty().withMessage('Contact person is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('technology').optional().trim(),
  body('onboardingDate').optional().isISO8601().toDate(),
  body('offboardingDate').optional().isISO8601().toDate(),
  body('status').optional().isIn(['active', 'inactive'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, industry, contactPerson, phone, address, technology, onboardingDate, offboardingDate, status } = req.body;

    // Check if client with same email exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }

    const client = new Client({
      name,
      email,
      industry,
      contactPerson,
      phone,
      address,
      technology,
      onboardingDate,
      offboardingDate,
      status
    });

    await client.save();

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update client (admin only)
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().trim(),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('industry').optional().trim(),
  body('contactPerson').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('technology').optional().trim(),
  body('onboardingDate').optional().isISO8601().toDate(),
  body('offboardingDate').optional().isISO8601().toDate(),
  body('status').optional().isIn(['active', 'inactive'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check for email uniqueness if email is being updated
    if (req.body.email && req.body.email !== client.email) {
      const existingClient = await Client.findOne({ email: req.body.email });
      if (existingClient) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      client
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete client (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
