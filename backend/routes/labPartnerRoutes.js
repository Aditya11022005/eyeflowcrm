import express from 'express';
import { 
  getLabPartners, 
  createLabPartner, 
  updateLabPartner, 
  deleteLabPartner, 
  getLabPartnerOrders,
  dispatchOrder
} from '../controllers/labPartnerController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

router.use(protect);
router.use(checkSubscription);

router.route('/dispatch')
  .post(checkRole('owner', 'staff'), dispatchOrder);

router.route('/')
  .get(getLabPartners)
  .post(checkRole('owner', 'staff'), createLabPartner);

router.route('/:id')
  .put(checkRole('owner', 'staff'), updateLabPartner)
  .delete(checkRole('owner'), deleteLabPartner);

router.route('/:id/orders')
  .get(getLabPartnerOrders);

export default router;
