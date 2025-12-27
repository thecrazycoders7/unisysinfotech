import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * ADMIN ONLY: Create new user (Employer or Employee)
 * POST /api/admin/users/create
 * Admin can create credentials and assign roles
 */
router.post('/users/create', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['employer', 'employee']).withMessage('Role must be employer or employee'),
  body('employerId').optional().isMongoId().withMessage('Invalid employer ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, role, designation, department, employerId } = req.body;

    // Check if user exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // If creating an employee, verify employer exists
    if (role === 'employee') {
      if (!employerId) {
        return res.status(400).json({ message: 'Employer ID is required for employee accounts' });
      }
      
      const employer = await User.findById(employerId);
      if (!employer || employer.role !== 'employer') {
        return res.status(400).json({ message: 'Invalid employer ID' });
      }
    }

    const user = new User({
      name,
      email,
      password,
      role,
      designation,
      department,
      employerId: role === 'employee' ? employerId : null,
      isActive: true
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employerId: user.employerId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Get all users (with filters)
 * GET /api/admin/users
 */
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('employerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Get employers list (for dropdown)
 * GET /api/admin/employers
 */
router.get('/employers', protect, authorize('admin'), async (req, res) => {
  try {
    const employers = await User.find({ role: 'employer', isActive: true })
      .select('_id name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      employers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Update user status (activate/deactivate)
 * PATCH /api/admin/users/:id/status
 */
router.patch('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Update user details
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', protect, authorize('admin'), [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['employer', 'employee']),
  body('employerId').optional().isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, role, designation, department, employerId } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing admin role
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot modify admin users' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (designation) user.designation = designation;
    if (department) user.department = department;
    
    if (role) {
      user.role = role;
      // If changing to employee, require employerId
      if (role === 'employee' && employerId) {
        user.employerId = employerId;
      } else if (role === 'employer') {
        user.employerId = null;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employerId: user.employerId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Delete user
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
