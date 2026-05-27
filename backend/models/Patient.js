import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add patient name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please add patient phone number'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'unspecified'],
    default: 'unspecified',
  },
  dob: {
    type: Date,
    default: null,
  },
  address: {
    type: String,
    default: '',
  },
  medicalHistory: {
    type: [String],
    default: [],
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound index to quicken search by store + (name or phone)
PatientSchema.index({ storeId: 1, name: 1 });
PatientSchema.index({ storeId: 1, phone: 1 });

export default mongoose.model('Patient', PatientSchema);
