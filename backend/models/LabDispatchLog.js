import mongoose from 'mongoose';

const LabDispatchLogSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabPartner',
    required: true,
  },
  channel: {
    type: String,
    enum: ['email', 'whatsapp', 'sms'],
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  messageText: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'pending', 'failed'],
    default: 'sent',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

LabDispatchLogSchema.index({ storeId: 1, partnerId: 1 });

export default mongoose.model('LabDispatchLog', LabDispatchLogSchema);
