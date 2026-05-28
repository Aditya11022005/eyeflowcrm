import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: [true, 'Please add discount value'],
  },
  active: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Coupon', CouponSchema);
