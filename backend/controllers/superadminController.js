import Store from '../models/Store.js';
import User from '../models/User.js';

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

// @desc    Update store subscription manually
// @route   PUT /api/superadmin/stores/:id/subscription
// @access  Private (Superadmin only)
export const updateStoreSubscription = async (req, res) => {
  const { plan, status, durationDays } = req.body;

  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    if (plan) store.subscriptionPlan = plan;
    if (status) store.subscriptionStatus = status;
    if (durationDays) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + Number(durationDays));
      store.subscriptionEndDate = endDate;
    }

    await store.save();

    res.json({
      success: true,
      message: 'Store subscription updated successfully by Super Admin',
      store,
    });
  } catch (error) {
    console.error('Update Store Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating store plan' });
  }
};

// @desc    Toggle store active/disabled status
// @route   DELETE /api/superadmin/stores/:id
// @access  Private (Superadmin only)
export const toggleStoreActive = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Toggle logic: update status to expired to freeze accounts
    const nextStatus = store.subscriptionStatus === 'expired' ? 'trial' : 'expired';
    store.subscriptionStatus = nextStatus;
    await store.save();

    res.json({
      success: true,
      message: `Store status changed to ${nextStatus}`,
      store,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error toggling store' });
  }
};
