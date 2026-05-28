import mongoose from 'mongoose';
import Store from '../models/Store.js';
import User from '../models/User.js';
import Package from '../models/Package.js';
import Announcement from '../models/Announcement.js';
import Testimonial from '../models/Testimonial.js';
import Coupon from '../models/Coupon.js';

export const seedStores = async () => {
  try {
    // Purge mock stores if they exist in the database
    const mockSlugs = [
      'metro-eye',
      'vision-care',
      'apex-optometry',
      'clear-sight',
      'elite-eyecare',
      'iris-optical',
      'spectrum-visuals',
      'focus-lens',
      'nova-optometry',
      'aura-eye'
    ];

    console.log('Checking for old mock stores to purge...');
    for (const slug of mockSlugs) {
      const store = await Store.findOne({ slug });
      if (store) {
        const storeId = store._id;
        // Cascade delete users and store registries
        await User.deleteMany({ storeId });
        
        const models = ['Patient', 'Inventory', 'Invoice', 'Appointment', 'Order', 'Prescription'];
        for (const modelName of models) {
          try {
            await mongoose.model(modelName).deleteMany({ storeId });
          } catch (err) {
            // Model not registered or loaded yet, ignore
          }
        }

        await Store.deleteOne({ _id: storeId });
        console.log(`Purged mock store and associated database registries: ${slug}`);
      }
    }

    // Skip seeding stores/owners as per user request to keep clinic directory data real.
    console.log('Skipping mock stores seeding to ensure clean registry.');

    // Seed default Pricing Packages
    const packageCount = await Package.countDocuments({});
    if (packageCount === 0) {
      console.log('Seeding default packages...');
      await Package.create([
        {
          name: 'Monthly Pack',
          price: 299,
          billingCycle: 'month',
          features: [
            'Unlimited patients & checkups',
            'Frame stock catalog with alerts',
            'Lab order tracking tracker',
            'Dynamic invoices and bills'
          ],
          badge: 'Standard',
          active: true
        },
        {
          name: 'Yearly Savings',
          price: 3399,
          billingCycle: 'year',
          features: [
            'Everything in Monthly Pack',
            'Priority laboratory updates',
            'Platform Superadmin direct support',
            '1-year stability lock'
          ],
          badge: 'Best Value',
          active: true
        }
      ]);
    }

    // Seed default Announcement
    const announcementCount = await Announcement.countDocuments({});
    if (announcementCount === 0) {
      console.log('Seeding default announcement...');
      await Announcement.create({
        text: '🎉 Eyelitz CRM v2.0 Released! Try it for free for 30 days. No credit card required.',
        bgColor: 'bg-clinic-500',
        textColor: 'text-white',
        active: true
      });
    }

    // Seed default Coupons
    const couponCount = await Coupon.countDocuments({});
    if (couponCount === 0) {
      console.log('Seeding default coupons...');
      await Coupon.create([
        {
          code: 'WELCOME50',
          discountType: 'percentage',
          discountValue: 50,
          active: true,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        },
        {
          code: 'SAVE100',
          discountType: 'flat',
          discountValue: 100,
          active: true,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      ]);
    }
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
};


