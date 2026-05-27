import Invoice from '../models/Invoice.js';
import Store from '../models/Store.js';
import Patient from '../models/Patient.js';

// @desc    Get all store invoices
// @route   GET /api/billing/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ storeId: req.storeId })
      .populate('patientId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error('Get Invoices Error:', error);
    res.status(500).json({ success: false, message: 'Server error listing invoices' });
  }
};

// @desc    Create a custom standalone invoice
// @route   POST /api/billing/invoices
// @access  Private
export const createCustomInvoice = async (req, res) => {
  const { patientId, items, discount, tax, paymentMethod, status } = req.body;

  try {
    const patient = await Patient.findOne({ _id: patientId, storeId: req.storeId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    let subtotal = 0;
    const invoiceItems = items.map(item => {
      const total = Number(item.quantity) * Number(item.price);
      subtotal += total;
      return {
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total,
      };
    });

    const discountAmt = Number(discount) || 0;
    const taxAmt = Number(tax) || 0;
    const totalAmount = Math.max(0, subtotal - discountAmt + taxAmt);

    const invoiceNumber = `INV-${new Date().toISOString().slice(2,10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = await Invoice.create({
      storeId: req.storeId,
      patientId,
      invoiceNumber,
      items: invoiceItems,
      subtotal,
      discount: discountAmt,
      tax: taxAmt,
      totalAmount,
      paymentMethod,
      status,
      paymentDate: status === 'paid' ? new Date() : null,
    });

    res.status(201).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error('Create Invoice Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating invoice' });
  }
};

// @desc    Simulate Razorpay payment and upgrade Store subscription
// @route   POST /api/billing/subscribe
// @access  Private (Owner only)
export const subscribePlan = async (req, res) => {
  const { planType, razorpayPaymentId } = req.body;

  try {
    if (!['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({ success: false, message: 'Invalid subscription plan selected' });
    }

    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Set expiration length
    const daysToAdd = planType === 'monthly' ? 30 : 365;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysToAdd);

    // Simulated Razorpay transaction update
    store.subscriptionPlan = planType;
    store.subscriptionStatus = 'active';
    store.subscriptionEndDate = endDate;
    store.subscriptionId = razorpayPaymentId || `pay_sim_${Math.random().toString(36).substring(2, 10)}`;

    await store.save();

    res.json({
      success: true,
      message: `Successfully upgraded to ${planType} subscription!`,
      store,
    });
  } catch (error) {
    console.error('Subscription Setup Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing subscription update' });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/billing/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, storeId: req.storeId })
      .populate('patientId', 'name phone email address')
      .populate('storeId');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error('Get Invoice Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving invoice details' });
  }
};
