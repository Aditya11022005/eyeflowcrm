import express from 'express';
import { getPlatformDashboard, updateStoreSubscription, toggleStoreActive } from '../controllers/superadminController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(checkRole('superadmin'));

router.get('/dashboard', getPlatformDashboard);
router.put('/stores/:id/subscription', updateStoreSubscription);
router.delete('/stores/:id', toggleStoreActive);

export default router;
