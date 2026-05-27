import mongoose from 'mongoose';

const EyeParametersSchema = new mongoose.Schema({
  sph: { type: String, default: '0.00' }, // Sphere
  cyl: { type: String, default: '0.00' }, // Cylinder
  axis: { type: String, default: '' },     // Axis (0-180)
  add: { type: String, default: '' },      // Addition for reading
  pd: { type: String, default: '' },       // Pupillary Distance
  va: { type: String, default: '' },       // Visual Acuity (e.g. 6/6, 20/20)
}, { _id: false });

const PrescriptionSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  checkupDate: {
    type: Date,
    default: Date.now,
  },
  rightEye: {
    type: EyeParametersSchema,
    required: true,
    default: () => ({}),
  },
  leftEye: {
    type: EyeParametersSchema,
    required: true,
    default: () => ({}),
  },
  lensTypeRecommended: {
    type: String, // e.g. Single Vision, Bifocal, Progressive, Contact Lens
    default: '',
  },
  remarks: {
    type: String,
    default: '',
  },
  doctorSignature: {
    type: String, // Doctor's typed name or signature image URL
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Prescription', PrescriptionSchema);
