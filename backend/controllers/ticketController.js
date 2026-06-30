import Ticket from '../models/Ticket.js';
import Store from '../models/Store.js';
import User from '../models/User.js';

// @desc    Create a new support ticket (Client)
// @route   POST /api/tickets
// @access  Private (Tenant Owner/Staff)
export const createTicket = async (req, res) => {
  const { subject, description, priority } = req.body;

  try {
    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    const count = await Ticket.countDocuments();
    const ticketId = `HD-${1000 + count + 1}`;

    const ticket = await Ticket.create({
      storeId: req.storeId,
      userId: req.user._id,
      ticketId,
      subject,
      description,
      priority: priority || 'medium',
      status: 'open',
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket raised successfully.',
      ticket,
    });
  } catch (error) {
    console.error('Create Ticket Error:', error);
    res.status(500).json({ success: false, message: 'Server error raising ticket' });
  }
};

// @desc    Get tickets for current client store (Client)
// @route   GET /api/tickets
// @access  Private (Tenant Owner/Staff)
export const getClientTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ storeId: req.storeId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error('Get Client Tickets Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tickets' });
  }
};

// @desc    Get all platform tickets (Super Admin)
// @route   GET /api/tickets/admin
// @access  Private (Super Admin only)
export const getAdminTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({})
      .populate('storeId', 'name email slug')
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error('Get Admin Tickets Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching admin tickets' });
  }
};

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private (Tenant Owner/Staff/Super Admin)
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('storeId', 'name email slug')
      .populate('userId', 'name email role');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Access control: must be from the same store, or be superadmin
    if (req.user.role !== 'superadmin' && ticket.storeId._id.toString() !== req.storeId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Get Ticket By ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving ticket details' });
  }
};

// @desc    Add a response reply message to a ticket
// @route   POST /api/tickets/:id/reply
// @access  Private (Tenant Owner/Staff/Super Admin)
export const addTicketResponse = async (req, res) => {
  const { message, status } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Access check: must belong to the store or be superadmin
    if (req.user.role !== 'superadmin' && ticket.storeId.toString() !== req.storeId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this ticket' });
    }

    // Add reply message
    ticket.responses.push({
      senderId: req.user._id,
      senderName: req.user.name,
      message,
    });

    // Update status if provided, or auto-set status
    if (status) {
      ticket.status = status;
    } else {
      // If superadmin replies, set to in-progress
      if (req.user.role === 'superadmin' && ticket.status === 'open') {
        ticket.status = 'in-progress';
      }
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Reply added successfully.',
      ticket,
    });
  } catch (error) {
    console.error('Add Ticket Response Error:', error);
    res.status(500).json({ success: false, message: 'Server error replying to ticket' });
  }
};

// @desc    Update ticket status (Super Admin / Owner closing ticket)
// @route   PUT /api/tickets/:id/status
// @access  Private
export const updateTicketStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Access check
    if (req.user.role !== 'superadmin' && ticket.storeId.toString() !== req.storeId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this ticket' });
    }

    ticket.status = status;
    await ticket.save();

    res.json({
      success: true,
      message: `Ticket status updated to ${status}`,
      ticket,
    });
  } catch (error) {
    console.error('Update Ticket Status Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};
