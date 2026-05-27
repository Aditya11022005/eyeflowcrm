import express from 'express';
import { getPatients, createPatient, getPatientById, updatePatient, deletePatient } from '../controllers/patientController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';
import { checkSubscription } from '../middleware/subscription.js';

const router = express.Router();

router.use(protect);
router.use(checkSubscription);

router.route('/')
  .get(getPatients)
  .post(createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(updatePatient)
  .delete(checkRole('owner', 'doctor'), deletePatient);

export default router;
