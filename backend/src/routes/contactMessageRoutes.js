import express from 'express';
import ContactMessage from '../models/ContactMessage.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/contact-messages
// @desc    Submit a new contact message
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Create new contact message
    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: contactMessage,
    });
  } catch (error) {
    console.error('Error creating contact message:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting contact form. Please try again.',
    });
  }
});

// @route   GET /api/contact-messages
// @desc    Get all contact messages (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort = '-submittedAt' } = req.query;
    
    const query = status ? { status } : {};
    
    const messages = await ContactMessage.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      data: messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact messages',
    });
  }
});

// @route   GET /api/contact-messages/:id
// @desc    Get single contact message by ID (admin only)
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact message',
    });
  }
});

// @route   PUT /api/contact-messages/:id
// @desc    Update contact message status (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact message status updated',
      data: message,
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact message',
    });
  }
});

// @route   DELETE /api/contact-messages/:id
// @desc    Delete contact message (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact message',
    });
  }
});

export default router;
