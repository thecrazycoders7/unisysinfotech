import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { protect, authorize } from '../middleware/auth.js';
import supabase from '../config/supabase.js';

const router = express.Router();

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
  body('employerId').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, role, designation, department, employerId } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
      
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // If creating an employee, verify employer exists
    if (role === 'employee') {
      if (!employerId) {
        return res.status(400).json({ message: 'Employer ID is required for employee accounts' });
      }
      
      const { data: employer } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', employerId)
        .single();
        
      if (!employer || employer.role !== 'employer') {
        return res.status(400).json({ message: 'Invalid employer ID' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        designation: designation?.trim() || '',
        department: department?.trim() || '',
        employer_id: role === 'employee' ? employerId : null,
        is_active: true
      })
      .select('id, name, email, role, employer_id')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employerId: user.employer_id
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
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
    
    let query = supabase
      .from('users')
      .select('id, name, email, role, designation, department, employer_id, is_active, created_at, updated_at');
    
    if (role) {
      query = query.eq('role', role);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data: users, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    // Populate employer information for employees
    const usersWithEmployers = await Promise.all(
      (users || []).map(async (user) => {
        if (user.employer_id) {
          const { data: employer } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', user.employer_id)
            .single();
          return {
            ...user,
            employerId: user.employer_id,
            employer: employer || null
          };
        }
        return {
          ...user,
          employerId: user.employer_id,
          employer: null
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithEmployers.length,
      users: usersWithEmployers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Get employers list (for dropdown)
 * GET /api/admin/employers
 */
router.get('/employers', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: employers, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'employer')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching employers:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    // Transform to match expected format
    const formattedEmployers = (employers || []).map(emp => ({
      _id: emp.id,
      id: emp.id,
      name: emp.name,
      email: emp.email
    }));

    res.status(200).json({
      success: true,
      employers: formattedEmployers
    });
  } catch (error) {
    console.error('Error fetching employers:', error);
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
    
    const { data: user, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', req.params.id)
      .select('id, is_active')
      .single();
      
    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        isActive: user.is_active
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
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
  body('employerId').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, role, designation, department, employerId } = req.body;
    
    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.params.id)
      .single();
      
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing admin role
    if (currentUser.role === 'admin') {
      return res.status(403).json({ message: 'Cannot modify admin users' });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (designation !== undefined) updateData.designation = designation?.trim() || '';
    if (department !== undefined) updateData.department = department?.trim() || '';
    
    if (role) {
      updateData.role = role;
      // If changing to employee, require employerId
      if (role === 'employee' && employerId) {
        updateData.employer_id = employerId;
      } else if (role === 'employer') {
        updateData.employer_id = null;
      }
    } else if (employerId !== undefined) {
      updateData.employer_id = employerId || null;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select('id, name, email, role, designation, department, employer_id')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employerId: user.employer_id
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ADMIN ONLY: Delete user
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Get user to check role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.params.id)
      .single();
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
