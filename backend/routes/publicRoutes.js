import express from 'express';
import Package from '../models/Package.js';
import Announcement from '../models/Announcement.js';
import Testimonial from '../models/Testimonial.js';

const router = express.Router();

// @desc    Get public landing page configurations (Packages, Testimonials, Announcement)
// @route   GET /api/public/landing-data
// @access  Public
router.get('/landing-data', async (req, res) => {
  try {
    const packages = await Package.find({ active: true });
    const announcement = await Announcement.findOne({ active: true }).sort({ updatedAt: -1 });
    const testimonials = await Testimonial.find({ active: true });

    res.json({
      success: true,
      packages,
      announcement,
      testimonials,
    });
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    res.status(500).json({ success: false, message: 'Server error fetching landing page data' });
  }
});

export default router;
