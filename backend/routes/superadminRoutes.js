import express from 'express';
import { 
  getPlatformDashboard, 
  createStore,
  updateStore,
  deleteStore,
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/superadminController.js';
import { protect } from '../middleware/auth.js';
import { checkRole } from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(checkRole('superadmin'));

router.get('/dashboard', getPlatformDashboard);
router.post('/stores', createStore);
router.route('/stores/:id')
  .put(updateStore)
  .delete(deleteStore);


// Package management routes
router.route('/packages')
  .get(getPackages)
  .post(createPackage);

router.route('/packages/:id')
  .put(updatePackage)
  .delete(deletePackage);

// Testimonial management routes
router.route('/testimonials')
  .get(getTestimonials)
  .post(createTestimonial);

router.route('/testimonials/:id')
  .put(updateTestimonial)
  .delete(deleteTestimonial);

// Announcement banner routes
router.route('/announcements')
  .get(getAnnouncements)
  .post(createAnnouncement);

router.route('/announcements/:id')
  .put(updateAnnouncement)
  .delete(deleteAnnouncement);

// Coupon management routes
router.route('/coupons')
  .get(getCoupons)
  .post(createCoupon);

router.route('/coupons/:id')
  .put(updateCoupon)
  .delete(deleteCoupon);

export default router;
