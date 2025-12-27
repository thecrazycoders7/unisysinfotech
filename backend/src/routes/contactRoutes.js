import express from 'express';
import Contact from '../models/Contact.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/contacts
// @desc    Submit a new contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      jobTitle,
      workEmail,
      company,
      employees,
      phone,
      country,
      productInterest,
      questionsComments,
    } = req.body;

    // Check if contact with this email already exists
    const existingContact = await Contact.findOne({ workEmail: workEmail.toLowerCase() });
    
    if (existingContact) {
      // Update existing contact instead of creating duplicate
      existingContact.firstName = firstName;
      existingContact.lastName = lastName;
      existingContact.jobTitle = jobTitle;
      existingContact.company = company;
      existingContact.employees = employees;
      existingContact.phone = phone;
      existingContact.country = country;
      existingContact.productInterest = productInterest;
      existingContact.questionsComments = questionsComments;
      existingContact.submittedAt = new Date();
      
      await existingContact.save();
      
      return res.status(200).json({
        success: true,
        message: 'Thank you for your interest! We have updated your information and will contact you within 24 hours.',
        data: existingContact,
      });
    }

    // Create new contact
    const contact = await Contact.create({
      firstName,
      lastName,
      jobTitle,
      workEmail,
      company,
      employees,
      phone,
      country,
      productInterest,
      questionsComments,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your interest! We will contact you within 24 hours.',
      data: contact,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    
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

// @route   GET /api/contacts
// @desc    Get all contacts (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sort = '-submittedAt' } = req.query;
    
    const query = status ? { status } : {};
    
    const contacts = await Contact.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
    });
  }
});

// @route   GET /api/contacts/:id
// @desc    Get single contact by ID (admin only)
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
    });
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update contact status (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated',
      data: contact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
    });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
    });
  }
});

export default router;
