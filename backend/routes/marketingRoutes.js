import express from 'express';
import { getMarketingDashboard, updateMarketingConfig, triggerCampaign } from '../controllers/marketingController.js';
import { protect } from '../middleware/auth.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

router.use(protect);
router.use(checkSubscription);

router.get('/dashboard', getMarketingDashboard);
router.put('/config', updateMarketingConfig);
router.post('/trigger', triggerCampaign);

export default router;
