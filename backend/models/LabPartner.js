import mongoose from 'mongoose';

const LabPartnerSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
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

LabPartnerSchema.index({ storeId: 1 });

export default mongoose.model('LabPartner', LabPartnerSchema);
