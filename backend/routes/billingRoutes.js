import express from 'express';
import { getInvoices, createCustomInvoice, subscribePlan, getInvoiceById, getPublicInvoiceById, validateCoupon, updateInvoice } from '../controllers/billingController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

// Public route accessible by patients (no JWT required)
router.get('/public/invoices/:id', getPublicInvoiceById);

router.use(protect);

// Allow plan registration even if current subscription expired
router.post('/subscribe', checkRole('owner'), subscribePlan);
router.post('/validate-coupon', checkRole('owner'), validateCoupon);

// Normal invoices require active subscription
router.route('/invoices')
  .get(checkSubscription, getInvoices)
  .post(checkSubscription, checkRole('owner', 'staff'), createCustomInvoice);

router.route('/invoices/:id')
  .get(checkSubscription, getInvoiceById)
  .put(checkSubscription, updateInvoice);

export default router;
