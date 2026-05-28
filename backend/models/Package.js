import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a package name'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please add a package price'],
  },
  billingCycle: {
    type: String,
    enum: ['month', 'year'],
    default: 'month',
  },
  features: {
    type: [String],
    default: [],
  },
  badge: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Package', PackageSchema);
