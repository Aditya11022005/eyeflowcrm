import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
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
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
  }],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  pointsRedeemed: {
    type: Number,
    default: 0,
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'net-banking', 'other'],
    default: 'cash',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  balanceDue: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['unpaid', 'partially-paid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  paymentDate: {
    type: Date,
    default: null,
  },
  terms: {
    type: String,
    default: '',
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

InvoiceSchema.index({ storeId: 1, patientId: 1 });
InvoiceSchema.index({ storeId: 1, invoiceDate: -1 });

export default mongoose.model('Invoice', InvoiceSchema);
