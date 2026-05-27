import express from 'express';
import { getInvoices, createCustomInvoice, subscribePlan, getInvoiceById } from '../controllers/billingController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

router.use(protect);

// Allow plan registration even if current subscription expired
router.post('/subscribe', checkRole('owner'), subscribePlan);

// Normal invoices require active subscription
router.route('/invoices')
  .get(checkSubscription, getInvoices)
  .post(checkSubscription, checkRole('owner', 'staff'), createCustomInvoice);

router.route('/invoices/:id')
  .get(checkSubscription, getInvoiceById);

export default router;
