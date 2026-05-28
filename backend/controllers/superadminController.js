import mongoose from 'mongoose';
import Store from '../models/Store.js';
import User from '../models/User.js';
import Package from '../models/Package.js';
import Announcement from '../models/Announcement.js';
import Testimonial from '../models/Testimonial.js';
import Coupon from '../models/Coupon.js';


// @desc    Get global platform stats for Super Admin
// @route   GET /api/superadmin/dashboard
// @access  Private (Superadmin only)
export const getPlatformDashboard = async (req, res) => {
  try {
    const totalStores = await Store.countDocuments({});
    const activeStores = await Store.countDocuments({ subscriptionStatus: 'active' });
    const trialStores = await Store.countDocuments({ subscriptionStatus: 'trial' });
    const expiredStores = await Store.countDocuments({ subscriptionStatus: 'expired' });

    const allStores = await Store.find({}).sort({ createdAt: -1 });

    // Calculate simulated or basic platform income
    // E.g. counting active stores under monthly/yearly values
    const totalOwners = await User.countDocuments({ role: 'owner' });

    res.json({
      success: true,
      stats: {
        totalStores,
        activeStores,
        trialStores,
        expiredStores,
        totalOwners,
      },
      stores: allStores,
    });
  } catch (error) {
    console.error('Superadmin Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error loading admin metrics' });
  }
};

// @desc    Create a new store and owner account manually
// @route   POST /api/superadmin/stores
// @access  Private (Superadmin only)
export const createStore = async (req, res) => {
  const { name, slug, email, phone, address, ownerName, password, subscriptionPlan, subscriptionStatus, subscriptionEndDate } = req.body;

  try {
    const slugExists = await Store.findOne({ slug: slug.toLowerCase() });
    if (slugExists) {
      return res.status(400).json({ success: false, message: 'Store URL slug is already taken' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Owner email is already registered' });
    }

    const store = await Store.create({
      name,
      slug: slug.toLowerCase(),
      email,
      phone,
      address,
      subscriptionPlan: subscriptionPlan || 'free',
      subscriptionStatus: subscriptionStatus || 'trial',
      subscriptionEndDate: subscriptionEndDate ? new Date(subscriptionEndDate) : undefined,
    });

    await User.create({
      storeId: store._id,
      name: ownerName || 'Clinic Owner',
      email: email.toLowerCase(),
      password: password || '123456',
      role: 'owner',
    });

    res.status(201).json({
      success: true,
      message: 'Store/Clinic onboarded successfully with owner account',
      store,
    });
  } catch (error) {
    console.error('Create Store Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update store details manually
// @route   PUT /api/superadmin/stores/:id
// @access  Private (Superadmin only)
export const updateStore = async (req, res) => {
  const { name, slug, email, phone, address, subscriptionPlan, subscriptionStatus, subscriptionEndDate } = req.body;

  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    if (slug && slug.toLowerCase() !== store.slug) {
      const slugExists = await Store.findOne({ slug: slug.toLowerCase() });
      if (slugExists) {
        return res.status(400).json({ success: false, message: 'Store URL slug is already taken' });
      }
      store.slug = slug.toLowerCase();
    }

    if (name) store.name = name;
    if (email) store.email = email;
    if (phone) store.phone = phone;
    if (address !== undefined) store.address = address;
    if (subscriptionPlan) store.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus) store.subscriptionStatus = subscriptionStatus;
    if (subscriptionEndDate !== undefined) {
      store.subscriptionEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null;
    }

    await store.save();

    res.json({
      success: true,
      message: 'Store updated successfully',
      store,
    });
  } catch (error) {
    console.error('Update Store Error:', error);
    res.status(550).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete store and all associated user/patient/invoice data
// @route   DELETE /api/superadmin/stores/:id
// @access  Private (Superadmin only)
export const deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Cascade delete associated users
    await User.deleteMany({ storeId: req.params.id });

    // Cascade delete store documents
    const models = ['Patient', 'Inventory', 'Invoice', 'Appointment', 'Order', 'Prescription'];
    for (const modelName of models) {
      try {
        await mongoose.model(modelName).deleteMany({ storeId: req.params.id });
      } catch (err) {
        // Model not loaded yet, skip
      }
    }

    res.json({
      success: true,
      message: 'Store and all associated clinical registries deleted permanently',
    });
  } catch (error) {
    console.error('Delete Store Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==================== PACKAGES MANAGEMENT ====================

export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find({}).sort({ price: 1 });
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPackage = async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== TESTIMONIALS MANAGEMENT ====================

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.json({ success: true, testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ANNOUNCEMENTS MANAGEMENT ====================

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    if (req.body.active) {
      await Announcement.updateMany({}, { active: false });
    }
    const announcement = await Announcement.create(req.body);
    res.json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    if (req.body.active) {
      await Announcement.updateMany({ _id: { $ne: req.params.id } }, { active: false });
    }
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== COUPON CONTROLLERS ====================
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

