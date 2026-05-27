import Store from '../models/Store.js';

export const checkSubscription = async (req, res, next) => {
  // Super Admin bypass
  if (req.user && req.user.role === 'superadmin') {
    return next();
  }

  try {
    if (!req.storeId) {
      return res.status(400).json({ success: false, message: 'No store or tenant associated with this account' });
    }

    const store = await Store.findById(req.storeId);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store/Clinic details not found' });
    }

    const now = new Date();

    // Check if store is active or if the trial/subscription has not expired
    const isTrialActive = store.subscriptionStatus === 'trial' && new Date(store.trialEndDate) > now;
    const isSubscriptionActive = store.subscriptionStatus === 'active' && new Date(store.subscriptionEndDate) > now;

    if (!isTrialActive && !isSubscriptionActive) {
      // Auto-update status to expired if it isn't already
      if (store.subscriptionStatus !== 'expired') {
        store.subscriptionStatus = 'expired';
        await store.save();
      }

      return res.status(403).json({
        success: false,
        isSubscriptionExpired: true,
        message: 'Your EyeFlow CRM subscription has expired. Please update your billing details to continue using the service.',
      });
    }

    next();
  } catch (error) {
    console.error('Subscription Check Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error validating subscription' });
  }
};
