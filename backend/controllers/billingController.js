import Invoice from '../models/Invoice.js';
import Store from '../models/Store.js';
import Patient from '../models/Patient.js';
import Coupon from '../models/Coupon.js';
import Package from '../models/Package.js';


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
  const { patientId, items, discount, tax, paymentMethod, status, redeemPoints } = req.body;

  try {
    const patient = await Patient.findOne({ _id: patientId, storeId: req.storeId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
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

    // Handle Loyalty Points Redemption
    let pointsRedeemed = 0;
    let pointsDiscount = 0;
    if (store.loyaltyPointsEnabled && redeemPoints && Number(redeemPoints) > 0) {
      const pointsToRedeem = Math.min(Number(redeemPoints), patient.loyaltyPoints || 0);
      pointsRedeemed = pointsToRedeem;
      pointsDiscount = pointsToRedeem * (store.pointValueInRupees || 1.0);
      patient.loyaltyPoints = Math.max(0, (patient.loyaltyPoints || 0) - pointsToRedeem);
    }

    const totalAmount = Math.max(0, subtotal - discountAmt - pointsDiscount + taxAmt);

    // Handle Loyalty Points Earning
    let pointsEarned = 0;
    if (store.loyaltyPointsEnabled && totalAmount > 0) {
      pointsEarned = Math.floor(totalAmount * (store.pointsPerRupee || 0.1));
      patient.loyaltyPoints = (patient.loyaltyPoints || 0) + pointsEarned;
    }

    await patient.save();

    const invoiceNumber = `INV-${new Date().toISOString().slice(2,10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = await Invoice.create({
      storeId: req.storeId,
      patientId,
      invoiceNumber,
      items: invoiceItems,
      subtotal,
      discount: discountAmt,
      pointsRedeemed,
      pointsEarned,
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
  const { planType, packageId, razorpayPaymentId, couponCode } = req.body;

  try {
    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    let finalAmount = 299;
    let billingCycle = 'month';
    let planName = 'monthly';

    if (packageId) {
      const pkg = await Package.findById(packageId);
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Selected package plan not found' });
      }
      finalAmount = pkg.price;
      billingCycle = pkg.billingCycle;
      planName = pkg.billingCycle === 'month' ? 'monthly' : 'yearly';
    } else {
      if (!['monthly', 'yearly'].includes(planType)) {
        return res.status(400).json({ success: false, message: 'Invalid subscription plan selected' });
      }
      const pkg = await Package.findOne({ billingCycle: planType === 'monthly' ? 'month' : 'year', active: true });
      if (pkg) {
        finalAmount = pkg.price;
        billingCycle = pkg.billingCycle;
        planName = pkg.billingCycle === 'month' ? 'monthly' : 'yearly';
      } else {
        finalAmount = planType === 'monthly' ? 299 : 3399;
        billingCycle = planType === 'monthly' ? 'month' : 'year';
        planName = planType;
      }
    }

    // Process Coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon) {
        const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
        if (!isExpired) {
          let discount = 0;
          if (coupon.discountType === 'percentage') {
            discount = Math.round((finalAmount * coupon.discountValue) / 100);
          } else {
            discount = coupon.discountValue;
          }
          finalAmount = Math.max(0, finalAmount - discount);
        }
      }
    }

    // Set expiration length
    const daysToAdd = billingCycle === 'month' ? 30 : 365;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysToAdd);

    // Simulated Razorpay transaction update
    store.subscriptionPlan = planName;
    store.subscriptionStatus = 'active';
    store.subscriptionEndDate = endDate;
    store.subscriptionId = razorpayPaymentId || `pay_sim_${Math.random().toString(36).substring(2, 10)}`;

    await store.save();

    res.json({
      success: true,
      message: `Successfully upgraded to ${planName} subscription! Final price: ₹${finalAmount}`,
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

// @desc    Get single invoice by ID (Public, unauthenticated)
// @route   GET /api/billing/public/invoices/:id
// @access  Public
export const getPublicInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
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
    console.error('Get Public Invoice Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving invoice details' });
  }
};

// @desc    Validate a subscription coupon code
// @route   POST /api/billing/validate-coupon
// @access  Private (Owner only)
export const validateCoupon = async (req, res) => {
  const { code, planType, packageId } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired' });
    }

    // Determine base price
    let basePrice = 299;
    if (packageId) {
      const pkg = await Package.findById(packageId);
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Package plan not found' });
      }
      basePrice = pkg.price;
    } else {
      const pkg = await Package.findOne({ billingCycle: planType === 'monthly' ? 'month' : 'year', active: true });
      if (pkg) {
        basePrice = pkg.price;
      } else {
        basePrice = planType === 'monthly' ? 299 : 3399;
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((basePrice * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    const finalPrice = Math.max(0, basePrice - discountAmount);

    res.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalPrice,
    });
  } catch (error) {
    console.error('Validate Coupon Error:', error);
    res.status(500).json({ success: false, message: 'Server error validating coupon' });
  }
};


