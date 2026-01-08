import express from 'express';
import Invoice from '../models/Invoice.js';
import PayrollDeduction from '../models/PayrollDeduction.js';
import { protect, authorize } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all invoices (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { month, name, status, search } = req.query;
    let query = {};

    if (month) {
      query.payrollMonth = month;
    }
    if (name) {
      query.name = new RegExp(name, 'i');
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.invoiceNumber = new RegExp(search, 'i');
    }

    const invoices = await Invoice.find(query)
      .populate('createdBy', 'name email')
      .sort({ invoiceDate: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single invoice
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Get payroll deductions if they exist
    const deductions = await PayrollDeduction.findOne({ invoiceId: req.params.id });

    res.status(200).json({
      success: true,
      invoice,
      deductions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create invoice
router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('payrollMonth').trim().notEmpty().withMessage('Payroll month is required'),
  body('invoiceDate').isISO8601().withMessage('Valid invoice date is required'),
  body('invoiceNumber').trim().notEmpty().withMessage('Invoice number is required'),
  body('invoiceAmount').isFloat({ min: 0 }).withMessage('Invoice amount must be a positive number'),
  body('numberOfHours').isFloat({ min: 0 }).withMessage('Number of hours must be a positive number'),
  body('clientName').trim().notEmpty().withMessage('Client name is required'),
  body('status').isIn(['Received', 'Pending', 'Waiting on Client']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      payrollMonth,
      invoiceDate,
      invoiceNumber,
      invoiceAmount,
      numberOfHours,
      clientName,
      endClient,
      employmentType,
      name1099,
      status,
      paymentReceivedDate,
      notes
    } = req.body;

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }

    const invoice = new Invoice({
      name,
      payrollMonth,
      invoiceDate,
      invoiceNumber,
      invoiceAmount,
      numberOfHours,
      clientName,
      endClient,
      employmentType,
      name1099,
      status,
      paymentReceivedDate,
      notes,
      createdBy: req.user.id
    });

    await invoice.save();

    // Create default payroll deductions
    const deductions = new PayrollDeduction({
      invoiceId: invoice._id
    });
    await deductions.save();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update invoice
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      payrollMonth,
      invoiceDate,
      invoiceNumber,
      invoiceAmount,
      numberOfHours,
      clientName,
      endClient,
      employmentType,
      name1099,
      status,
      paymentReceivedDate,
      notes
    } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if invoice number is being changed and if it already exists
    if (invoiceNumber && invoiceNumber !== invoice.invoiceNumber) {
      const existingInvoice = await Invoice.findOne({ invoiceNumber });
      if (existingInvoice) {
        return res.status(400).json({ message: 'Invoice number already exists' });
      }
    }

    // Update fields
    if (name) invoice.name = name;
    if (payrollMonth) invoice.payrollMonth = payrollMonth;
    if (invoiceDate) invoice.invoiceDate = invoiceDate;
    if (invoiceNumber) invoice.invoiceNumber = invoiceNumber;
    if (invoiceAmount !== undefined) invoice.invoiceAmount = invoiceAmount;
    if (numberOfHours !== undefined) invoice.numberOfHours = numberOfHours;
    if (clientName) invoice.clientName = clientName;
    if (endClient !== undefined) invoice.endClient = endClient;
    if (employmentType) invoice.employmentType = employmentType;
    if (name1099 !== undefined) invoice.name1099 = name1099;
    if (status) invoice.status = status;
    if (paymentReceivedDate !== undefined) invoice.paymentReceivedDate = paymentReceivedDate;
    if (notes !== undefined) invoice.notes = notes;

    await invoice.save();

    // Recalculate payroll deductions if invoice amount changed
    if (invoiceAmount !== undefined) {
      const deductions = await PayrollDeduction.findOne({ invoiceId: invoice._id });
      if (deductions && !deductions.isOverride) {
        await deductions.save(); // Trigger pre-save hook to recalculate
      }
    }

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete invoice
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Delete associated payroll deductions
    await PayrollDeduction.deleteOne({ invoiceId: req.params.id });

    await invoice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending invoices
router.get('/pending/tracker', protect, authorize('admin'), async (req, res) => {
  try {
    const pendingInvoices = await Invoice.find({
      status: { $in: ['Pending', 'Waiting on Client'] }
    }).sort({ invoiceDate: -1 });

    // Group by person
    const groupedByPerson = {};
    
    pendingInvoices.forEach(invoice => {
      if (!groupedByPerson[invoice.name]) {
        groupedByPerson[invoice.name] = {
          name: invoice.name,
          invoices: [],
          totalPending: 0
        };
      }
      groupedByPerson[invoice.name].invoices.push(invoice);
      groupedByPerson[invoice.name].totalPending += invoice.invoiceAmount;
    });

    const result = Object.values(groupedByPerson);

    res.status(200).json({
      success: true,
      count: result.length,
      pendingByPerson: result
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payroll deductions
router.put('/:id/deductions', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      amount1099,
      amountW2,
      unisysTax,
      unisysCharges,
      otherDeductions,
      isOverride,
      overrideAmount
    } = req.body;

    let deductions = await PayrollDeduction.findOne({ invoiceId: req.params.id });

    if (!deductions) {
      // Create if doesn't exist
      deductions = new PayrollDeduction({ invoiceId: req.params.id });
    }

    // Update fields
    if (amount1099 !== undefined) deductions.amount1099 = amount1099;
    if (amountW2 !== undefined) deductions.amountW2 = amountW2;
    if (unisysTax !== undefined) deductions.unisysTax = unisysTax;
    if (unisysCharges !== undefined) deductions.unisysCharges = unisysCharges;
    if (otherDeductions !== undefined) deductions.otherDeductions = otherDeductions;
    if (isOverride !== undefined) deductions.isOverride = isOverride;
    if (overrideAmount !== undefined) deductions.overrideAmount = overrideAmount;

    await deductions.save();

    res.status(200).json({
      success: true,
      message: 'Payroll deductions updated successfully',
      deductions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
