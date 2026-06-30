import express from 'express';
import { 
  registerStore, loginUser, getMe, addStaff, getStaffList, 
  updateProfile, updateStore, verifyEmail, resendVerification,
  forgotPassword, resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';

const router = express.Router();

router.post('/signup', registerStore);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/store', protect, checkRole('owner'), updateStore);
router.post('/staff', protect, checkRole('owner'), addStaff);
router.get('/staff', protect, getStaffList);

export default router;
