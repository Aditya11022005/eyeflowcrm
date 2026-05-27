import express from 'express';
import { getOrders, createOrder, getOrderById, updateOrder, deleteOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

router.use(protect);
router.use(checkSubscription);

router.route('/')
  .get(getOrders)
  .post(checkRole('owner', 'staff'), createOrder);

router.route('/:id')
  .get(getOrderById)
  .put(checkRole('owner', 'staff'), updateOrder)
  .delete(checkRole('owner'), deleteOrder);

export default router;
