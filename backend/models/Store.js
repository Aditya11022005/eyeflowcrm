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
  
  // Loyalty Points Configuration
  loyaltyPointsEnabled: {
    type: Boolean,
    default: false,
  },
  pointsPerRupee: {
    type: Number,
    default: 0.1, // e.g. 0.1 points per 1 INR spent (10% back in points)
  },
  pointValueInRupees: {
    type: Number,
    default: 1.0, // e.g. 1 point = 1 INR
  },

  // Automated Marketing Campaigns Configuration
  birthdayWishesEnabled: {
    type: Boolean,
    default: false,
  },
  birthdayTemplate: {
    type: String,
    default: "Wish you a very Happy Birthday [Patient Name]! Get 15% off on optical frames at [Clinic Name] today.",
  },
  
  checkupRemindersEnabled: {
    type: Boolean,
    default: false,
  },
  checkupTemplate: {
    type: String,
    default: "Hello [Patient Name], it has been a year since your last eye checkup. Keep your eyes healthy and schedule a visit today at [Clinic Name].",
  },
  
  googleReviewEnabled: {
    type: Boolean,
    default: false,
  },
  googleReviewLink: {
    type: String,
    default: "",
  },
    googleReviewTemplate: {
      type: String,
      default: "Thank you for visiting [Clinic Name], [Patient Name]! Please share your feedback on Google: [Review Link]",
    },
    
    // WhatsApp API Gateway Settings (For 100% automatic background sending)
    whatsappGatewayProvider: {
      type: String,
      enum: ['none', 'ultramsg'],
      default: 'none',
    },
    whatsappGatewayInstanceId: {
      type: String,
      default: '',
    },
    whatsappGatewayToken: {
      type: String,
      default: '',
    },
    eyeCheckupFee: {
      type: Number,
      default: 100,
    },
    invoiceTerms: {
      type: String,
      default: "Thank you for your purchase. Optics frames support 1-year manufacturers warranties. Corrective lens scratches are not covered by warranty limits.",
    },
  }, {
    timestamps: true,
  });

export default mongoose.model('Store', StoreSchema);
