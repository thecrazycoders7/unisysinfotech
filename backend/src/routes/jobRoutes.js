import express from 'express';
import JobPosting from '../models/JobPosting.js';
import JobApplication from '../models/JobApplication.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
// Get all active job postings
router.get('/', async (req, res) => {
  try {
    const jobs = await JobPosting.find({ isActive: true })
      .sort({ displayOrder: 1, postedDate: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job postings',
      error: error.message
    });
  }
});

// Get single job posting by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job posting',
      error: error.message
    });
  }
});

// Submit job application
router.post('/:id/apply', async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job posting is no longer active'
      });
    }

    const application = await JobApplication.create({
      jobId: req.params.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
});

// Admin routes (protected)
// Get all job postings (including inactive)
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const jobs = await JobPosting.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job postings',
      error: error.message
    });
  }
});

// Create new job posting
router.post('/admin/create', protect, authorize('admin'), async (req, res) => {
  try {
    const job = await JobPosting.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating job posting',
      error: error.message
    });
  }
});

// Update job posting
router.put('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const job = await JobPosting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.json({
      success: true,
      message: 'Job posting updated successfully',
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating job posting',
      error: error.message
    });
  }
});

// Delete job posting
router.delete('/admin/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const job = await JobPosting.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting job posting',
      error: error.message
    });
  }
});

// Get all applications for a job
router.get('/admin/:id/applications', protect, authorize('admin'), async (req, res) => {
  try {
    const applications = await JobApplication.find({ jobId: req.params.id })
      .sort({ appliedDate: -1 })
      .populate('jobId', 'title department');
    
    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Get all applications (all jobs)
router.get('/admin/applications/all', protect, authorize('admin'), async (req, res) => {
  try {
    const applications = await JobApplication.find()
      .sort({ appliedDate: -1 })
      .populate('jobId', 'title department location');
    
    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Update application status
router.put('/admin/applications/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('jobId', 'title department');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
});

export default router;
