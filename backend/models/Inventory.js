import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add inventory item name'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'Please add SKU or product code'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['frame', 'lens', 'contact-lens', 'solution', 'accessory', 'other'],
    required: true,
  },
  brand: {
    type: String,
    default: '',
  },
  supplier: {
    type: String,
    default: '',
  },
  costPrice: {
    type: Number,
    required: [true, 'Please add cost price'],
    default: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Please add selling price'],
    default: 0,
  },
  quantity: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0,
  },
  minStockAlert: {
    type: Number,
    default: 5, // Triggers warning if quantity <= minStockAlert
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Ensure SKU is unique within a single store/tenant
InventorySchema.index({ storeId: 1, sku: 1 }, { unique: true });

export default mongoose.model('Inventory', InventorySchema);
