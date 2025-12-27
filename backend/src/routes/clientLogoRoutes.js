import express from 'express';
import ClientLogo from '../models/ClientLogo.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all active client logos (public)
router.get('/', async (req, res) => {
  try {
    const logos = await ClientLogo.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 });
    res.json(logos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client logos', error: error.message });
  }
});

// Get all client logos including inactive (admin only)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const logos = await ClientLogo.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json(logos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client logos', error: error.message });
  }
});

// Get single client logo
router.get('/:id', async (req, res) => {
  try {
    const logo = await ClientLogo.findById(req.params.id);
    if (!logo) {
      return res.status(404).json({ message: 'Client logo not found' });
    }
    res.json(logo);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client logo', error: error.message });
  }
});

// Create new client logo (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const logo = new ClientLogo(req.body);
    await logo.save();
    res.status(201).json(logo);
  } catch (error) {
    res.status(400).json({ message: 'Error creating client logo', error: error.message });
  }
});

// Update client logo (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const logo = await ClientLogo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!logo) {
      return res.status(404).json({ message: 'Client logo not found' });
    }

    res.json(logo);
  } catch (error) {
    res.status(400).json({ message: 'Error updating client logo', error: error.message });
  }
});

// Delete client logo (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const logo = await ClientLogo.findByIdAndDelete(req.params.id);
    if (!logo) {
      return res.status(404).json({ message: 'Client logo not found' });
    }

    res.json({ message: 'Client logo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client logo', error: error.message });
  }
});

export default router;
