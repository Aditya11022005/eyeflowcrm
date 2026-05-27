import Order from '../models/Order.js';
import Patient from '../models/Patient.js';
import Inventory from '../models/Inventory.js';
import Invoice from '../models/Invoice.js';

// Helper to generate Invoice / Order Numbers
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(2,10).replace(/-/g, "");
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomStr}`;
};

// @desc    Get all orders with search and filter options
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  const { status, search = '' } = req.query;

  try {
    const query = { storeId: req.storeId };

    if (status) {
      query.orderStatus = status;
    }

    let patientIds = [];
    if (search) {
      const matchingPatients = await Patient.find({
        storeId: req.storeId,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      });
      patientIds = matchingPatients.map(p => p._id);
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { patientId: { $in: patientIds } },
      ];
    }

    const orders = await Order.find(query)
      .populate('patientId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server error listing orders' });
  }
};

// @desc    Create a glass or lens order
// @route   POST /api/orders
// @access  Private (Owner/Staff)
export const createOrder = async (req, res) => {
  const { patientId, prescriptionId, frameDetails, lensDetails, discount, tax, amountPaid, promisedDate, remarks } = req.body;

  try {
    const patient = await Patient.findOne({ _id: patientId, storeId: req.storeId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Calculate billing
    const framePrice = Number(frameDetails?.price) || 0;
    const lensPrice = Number(lensDetails?.price) || 0;
    const subtotal = framePrice + lensPrice;
    const discountAmt = Number(discount) || 0;
    const taxAmt = Number(tax) || 0;
    const finalAmount = Math.max(0, subtotal - discountAmt + taxAmt);
    const paid = Number(amountPaid) || 0;

    let paymentStatus = 'unpaid';
    if (paid >= finalAmount && finalAmount > 0) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partially-paid';
    }

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      storeId: req.storeId,
      patientId,
      prescriptionId: prescriptionId || null,
      orderNumber,
      frameDetails,
      lensDetails,
      totalAmount: subtotal,
      discount: discountAmt,
      tax: taxAmt,
      finalAmount,
      amountPaid: paid,
      paymentStatus,
      promisedDate,
      remarks,
    });

    // Reduce Frame Inventory if frame SKU is provided and matches
    if (frameDetails?.sku) {
      const invItem = await Inventory.findOne({ storeId: req.storeId, sku: frameDetails.sku });
      if (invItem && invItem.quantity > 0) {
        invItem.quantity -= 1;
        await invItem.save();
      }
    }

    // Auto-create Invoice
    const invoiceNum = orderNumber.replace('ORD', 'INV');
    const invoiceItems = [];
    if (frameDetails?.brand) {
      invoiceItems.push({
        description: `Frame: ${frameDetails.brand} ${frameDetails.model || ''}`,
        quantity: 1,
        price: framePrice,
        total: framePrice,
      });
    }
    if (lensDetails?.type) {
      invoiceItems.push({
        description: `Lens: ${lensDetails.type} (${lensDetails.coating || ''})`,
        quantity: 1,
        price: lensPrice,
        total: lensPrice,
      });
    }

    await Invoice.create({
      storeId: req.storeId,
      patientId,
      orderId: order._id,
      invoiceNumber: invoiceNum,
      items: invoiceItems.length > 0 ? invoiceItems : [{ description: 'Optical Order Package', quantity: 1, price: subtotal, total: subtotal }],
      subtotal,
      discount: discountAmt,
      tax: taxAmt,
      totalAmount: finalAmount,
      paymentMethod: paid > 0 ? 'cash' : 'other', // fallback default
      status: paymentStatus === 'paid' ? 'paid' : 'unpaid',
      paymentDate: paid > 0 ? new Date() : null,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating optical order' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, storeId: req.storeId })
      .populate('patientId', 'name phone email address')
      .populate('prescriptionId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const invoice = await Invoice.findOne({ orderId: order._id, storeId: req.storeId });

    res.json({
      success: true,
      order,
      invoice,
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving order details' });
  }
};

// @desc    Update order status or payments
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  const { orderStatus, amountPaid, paymentMethod } = req.body;

  try {
    const order = await Order.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (amountPaid !== undefined) {
      const additionalPaid = Number(amountPaid) - order.amountPaid;
      order.amountPaid = Number(amountPaid);

      if (order.amountPaid >= order.finalAmount) {
        order.paymentStatus = 'paid';
      } else if (order.amountPaid > 0) {
        order.paymentStatus = 'partially-paid';
      } else {
        order.paymentStatus = 'unpaid';
      }

      // Sync corresponding invoice
      const invoice = await Invoice.findOne({ orderId: order._id, storeId: req.storeId });
      if (invoice) {
        invoice.status = order.paymentStatus === 'paid' ? 'paid' : 'unpaid';
        if (paymentMethod) {
          invoice.paymentMethod = paymentMethod;
        }
        if (order.paymentStatus === 'paid') {
          invoice.paymentDate = new Date();
        }
        await invoice.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating order' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Owner only)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    await Invoice.deleteMany({ orderId: req.params.id, storeId: req.storeId });

    res.json({
      success: true,
      message: 'Order and associated invoices deleted successfully',
    });
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting order' });
  }
};
