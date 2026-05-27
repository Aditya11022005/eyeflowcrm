import express from 'express';
import { getDashboardData } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

router.get('/dashboard', protect, checkSubscription, getDashboardData);

export default router;
