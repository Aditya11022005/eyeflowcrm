import express from 'express';
import { getPrescriptions, createPrescription, getPrescriptionById, deletePrescription } from '../controllers/prescriptionController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

router.use(protect);
router.use(checkSubscription);

router.route('/')
  .get(getPrescriptions)
  .post(checkRole('owner', 'doctor'), createPrescription);

router.route('/:id')
  .get(getPrescriptionById)
  .delete(checkRole('owner', 'doctor'), deletePrescription);

export default router;
