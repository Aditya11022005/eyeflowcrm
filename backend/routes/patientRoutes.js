import express from 'express';
import { 
  getPatients, 
  createPatient, 
  getPatientById, 
  updatePatient, 
  deletePatient,
  addPatientAttachment,
  deletePatientAttachment
} from '../controllers/patientController.js';
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

router.route('/:id/attachments')
  .post(addPatientAttachment);

router.route('/:id/attachments/:attachmentId')
  .delete(deletePatientAttachment);

export default router;
