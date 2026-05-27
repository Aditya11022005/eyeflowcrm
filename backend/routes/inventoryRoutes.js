import express from 'express';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

router.use(protect);
router.use(checkSubscription);

router.route('/')
  .get(getInventory)
  .post(checkRole('owner', 'staff'), createInventoryItem);

router.route('/:id')
  .put(checkRole('owner', 'staff'), updateInventoryItem)
  .delete(checkRole('owner'), deleteInventoryItem);

export default router;
