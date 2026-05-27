import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a store or clinic name'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Please add a unique store slug'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add a store email'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please add a store phone number'],
  },
  address: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  subscriptionStatus: {
    type: String,
    enum: ['trial', 'active', 'expired', 'cancelled'],
    default: 'trial',
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'monthly', 'yearly'],
    default: 'free',
  },
  subscriptionId: {
    type: String,
    default: null,
  },
  trialEndDate: {
    type: Date,
    default: () => {
      // 30 days trial
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    },
  },
  subscriptionEndDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30); // Matches trial initial length
      return date;
    },
  },
}, {
  timestamps: true,
});

export default mongoose.model('Store', StoreSchema);
