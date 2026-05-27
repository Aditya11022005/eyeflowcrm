import Inventory from '../models/Inventory.js';
import Notification from '../models/Notification.js';

// @desc    Get all inventory items with filtering and search
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (req, res) => {
  const { category, search = '' } = req.query;

  try {
    const query = { storeId: req.storeId };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const inventory = await Inventory.find(query).sort({ name: 1 });

    res.json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error('Get Inventory Error:', error);
    res.status(500).json({ success: false, message: 'Server error listing inventory items' });
  }
};

// @desc    Create a product in inventory
// @route   POST /api/inventory
// @access  Private (Owner/Staff)
export const createInventoryItem = async (req, res) => {
  const { name, sku, category, brand, supplier, costPrice, sellingPrice, quantity, minStockAlert } = req.body;

  try {
    // Check if SKU already exists for this tenant
    const skuExists = await Inventory.findOne({ storeId: req.storeId, sku: sku.trim() });
    if (skuExists) {
      return res.status(400).json({ success: false, message: 'An item with this SKU/barcode already exists in your inventory' });
    }

    const item = await Inventory.create({
      storeId: req.storeId,
      name,
      sku: sku.trim(),
      category,
      brand,
      supplier,
      costPrice,
      sellingPrice,
      quantity,
      minStockAlert,
    });

    // Check if initial stock triggers warning
    if (item.quantity <= item.minStockAlert) {
      await Notification.create({
        storeId: req.storeId,
        title: 'Low Stock Alert',
        message: `Inventory item "${item.name}" (${item.brand}) is running low on stock. Current quantity: ${item.quantity}.`,
        type: 'low-stock',
      });
    }

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Create Inventory Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating inventory item' });
  }
};

// @desc    Update stock quantities and details
// @route   PUT /api/inventory/:id
// @access  Private (Owner/Staff)
export const updateInventoryItem = async (req, res) => {
  try {
    let item = await Inventory.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Trigger low stock notifications if quantity drops
    if (item.quantity <= item.minStockAlert) {
      // Check if alert already sent recently to avoid duplication (simple toggle)
      const existingAlert = await Notification.findOne({
        storeId: req.storeId,
        type: 'low-stock',
        message: { $regex: item.name },
        isRead: false,
      });

      if (!existingAlert) {
        await Notification.create({
          storeId: req.storeId,
          title: 'Low Stock Warning',
          message: `Inventory item "${item.name}" is low. Remaining: ${item.quantity} (Threshold: ${item.minStockAlert}).`,
          type: 'low-stock',
        });
      }
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Update Inventory Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating inventory item' });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Owner only)
export const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Inventory item removed successfully from catalogue',
    });
  } catch (error) {
    console.error('Delete Inventory Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting inventory item' });
  }
};
