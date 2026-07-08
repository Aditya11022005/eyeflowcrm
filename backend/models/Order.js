import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
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
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    default: null,
  },
  orderNumber: {
    type: String,
    required: true,
  },
  frameDetails: {
    brand: { type: String, default: '' },
    model: { type: String, default: '' },
    color: { type: String, default: '' },
    sku: { type: String, default: '' },
    price: { type: Number, default: 0 },
  },
  lensDetails: {
    type: { type: String, default: '' }, // Single Vision, Bifocal, Progressive
    brand: { type: String, default: '' },
    coating: { type: String, default: '' }, // Anti-glare, Blue Cut, Photochromic
    sku: { type: String, default: '' },
    price: { type: Number, default: 0 },
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'sent-to-lab', 'ready-for-pickup', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially-paid', 'paid'],
    default: 'unpaid',
  },
  promisedDate: {
    type: Date,
    default: null,
  },
  remarks: {
    type: String,
    default: '',
  },
  labPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabPartner',
    default: null,
  },
  labSentDate: {
    type: Date,
    default: null,
  },
  labDispatchChannel: {
    type: String,
    enum: ['email', 'whatsapp', 'sms', ''],
    default: '',
  },
}, {
  timestamps: true,
});

OrderSchema.index({ storeId: 1, patientId: 1 });
OrderSchema.index({ storeId: 1, orderStatus: 1 });
OrderSchema.index({ storeId: 1, createdAt: -1 });

export default mongoose.model('Order', OrderSchema);
