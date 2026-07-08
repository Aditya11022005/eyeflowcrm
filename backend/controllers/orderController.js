import Order from '../models/Order.js';
import Patient from '../models/Patient.js';
import Inventory from '../models/Inventory.js';
import Invoice from '../models/Invoice.js';
import Prescription from '../models/Prescription.js';
import LabPartner from '../models/LabPartner.js';
import Store from '../models/Store.js';

// Helper to generate Invoice / Order Numbers
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(2,10).replace(/-/g, "");
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomStr}`;
};

// @desc    Get all orders with search and filter options
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  const { status, search = '' } = req.query;

  try {
    const query = { storeId: req.storeId };

    if (status) {
      query.orderStatus = status;
    }

    let patientIds = [];
    if (search) {
      const matchingPatients = await Patient.find({
        storeId: req.storeId,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      });
      patientIds = matchingPatients.map(p => p._id);
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { patientId: { $in: patientIds } },
      ];
    }

    const orders = await Order.find(query)
      .populate('patientId', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server error listing orders' });
  }
};

// @desc    Create a glass or lens order
// @route   POST /api/orders
// @access  Private (Owner/Staff)
export const createOrder = async (req, res) => {
  const { patientId, prescriptionId, frameDetails, lensDetails, discount, tax, amountPaid, promisedDate, remarks, invoiceDate, paymentMethod } = req.body;

  try {
    const patient = await Patient.findOne({ _id: patientId, storeId: req.storeId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Calculate billing
    const framePrice = Number(frameDetails?.price) || 0;
    const lensPrice = Number(lensDetails?.price) || 0;
    const subtotal = framePrice + lensPrice;
    const discountAmt = Number(discount) || 0;
    const taxAmt = Number(tax) || 0;
    const finalAmount = Math.max(0, subtotal - discountAmt + taxAmt);
    const paid = Number(amountPaid) || 0;

    let paymentStatus = 'unpaid';
    if (paid >= finalAmount && finalAmount > 0) {
      paymentStatus = 'paid';
    } else if (paid > 0) {
      paymentStatus = 'partially-paid';
    }

    const orderNumber = generateOrderNumber();

    let linkedPrescriptionId = prescriptionId;
    if (!linkedPrescriptionId) {
      const latestPrescription = await Prescription.findOne({ patientId, storeId: req.storeId })
        .sort({ checkupDate: -1, createdAt: -1 });
      if (latestPrescription) {
        linkedPrescriptionId = latestPrescription._id;
      }
    }

    const order = await Order.create({
      storeId: req.storeId,
      patientId,
      prescriptionId: linkedPrescriptionId || null,
      orderNumber,
      frameDetails,
      lensDetails,
      totalAmount: subtotal,
      discount: discountAmt,
      tax: taxAmt,
      finalAmount,
      amountPaid: paid,
      paymentStatus,
      promisedDate,
      remarks,
    });

    // Reduce Frame Inventory if frame SKU is provided and matches
    if (frameDetails?.sku) {
      const invItem = await Inventory.findOne({ storeId: req.storeId, sku: frameDetails.sku });
      if (invItem && invItem.quantity > 0) {
        invItem.quantity -= 1;
        await invItem.save();
      }
    }

    // Reduce Lens Inventory if lens SKU is provided and matches
    if (lensDetails?.sku) {
      const invItem = await Inventory.findOne({ storeId: req.storeId, sku: lensDetails.sku });
      if (invItem && invItem.quantity > 0) {
        invItem.quantity -= 1;
        await invItem.save();
      }
    }

    // Auto-create Invoice
    const invoiceNum = orderNumber.replace('ORD', 'INV');
    const invoiceItems = [];
    if (frameDetails?.brand) {
      invoiceItems.push({
        description: `Frame: ${frameDetails.brand} ${frameDetails.model || ''}`,
        quantity: 1,
        price: framePrice,
        total: framePrice,
      });
    }
    if (lensDetails?.type) {
      invoiceItems.push({
        description: `Lens: ${lensDetails.type} (${lensDetails.coating || ''})`,
        quantity: 1,
        price: lensPrice,
        total: lensPrice,
      });
    }

    await Invoice.create({
      storeId: req.storeId,
      patientId,
      orderId: order._id,
      invoiceNumber: invoiceNum,
      items: invoiceItems.length > 0 ? invoiceItems : [{ description: 'Optical Order Package', quantity: 1, price: subtotal, total: subtotal }],
      subtotal,
      discount: discountAmt,
      tax: taxAmt,
      totalAmount: finalAmount,
      amountPaid: paid,
      balanceDue: Math.max(0, finalAmount - paid),
      paymentMethod: paymentMethod || (paid > 0 ? 'cash' : 'other'),
      status: paymentStatus === 'partially-paid' ? 'unpaid' : paymentStatus,
      paymentDate: paid > 0 ? (invoiceDate ? new Date(invoiceDate) : new Date()) : null,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating optical order' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, storeId: req.storeId })
      .populate('patientId', 'name phone email address')
      .populate('prescriptionId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const invoice = await Invoice.findOne({ orderId: order._id, storeId: req.storeId });

    res.json({
      success: true,
      order,
      invoice,
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving order details' });
  }
};

// @desc    Update order status or payments
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  const { orderStatus, amountPaid, paymentMethod, labPartnerId, labDispatchChannel } = req.body;

  try {
    const order = await Order.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let dispatchData = null;

    if (orderStatus) {
      if (orderStatus === 'cancelled') {
        if (order.orderStatus !== 'pending') {
          return res.status(400).json({ success: false, message: 'Cannot cancel order once it has been sent to the lab or processed further.' });
        }

        // Restore inventory stock
        if (order.frameDetails?.sku) {
          const invItem = await Inventory.findOne({ storeId: req.storeId, sku: order.frameDetails.sku });
          if (invItem) {
            invItem.quantity += 1;
            await invItem.save();
          }
        }
        if (order.lensDetails?.sku) {
          const invItem = await Inventory.findOne({ storeId: req.storeId, sku: order.lensDetails.sku });
          if (invItem) {
            invItem.quantity += 1;
            await invItem.save();
          }
        }

        // Sync corresponding invoice (mark unpaid and clear amounts)
        const invoice = await Invoice.findOne({ orderId: order._id, storeId: req.storeId });
        if (invoice) {
          invoice.status = 'unpaid';
          invoice.amountPaid = 0;
          invoice.balanceDue = 0;
          await invoice.save();
        }

        order.amountPaid = 0;
        order.paymentStatus = 'unpaid';
      }

      if (orderStatus === 'sent-to-lab') {
        order.labPartnerId = labPartnerId || null;
        order.labSentDate = new Date();
        order.labDispatchChannel = labDispatchChannel || '';

        // Generate dispatch details text
        if (labPartnerId) {
          const partner = await LabPartner.findById(labPartnerId);
          if (partner) {
            const store = await Store.findById(req.storeId || req.user?.storeId);
            let clinicText = '';
            if (store) {
              clinicText = `[CLINIC INFO]
Clinic Name: ${store.name || 'N/A'}
Phone: ${store.phone || 'N/A'}
Email: ${store.email || 'N/A'}
Address: ${store.address || 'N/A'}
`;
            }

            const populatedOrder = await Order.findById(order._id).populate('patientId');
            let rxDetails = {
              od_sph: '-', od_cyl: '-', od_axis: '-', od_add: '-', od_pd: '-', od_va: '-',
              os_sph: '-', os_cyl: '-', os_axis: '-', os_add: '-', os_pd: '-', os_va: '-'
            };
            let rxText = 'No active prescription details';
            if (order.prescriptionId) {
              try {
                const prescription = await Prescription.findById(order.prescriptionId);
                if (prescription) {
                  rxDetails = {
                    od_sph: prescription.rightEye?.sph || '0.00',
                    od_cyl: prescription.rightEye?.cyl || '0.00',
                    od_axis: prescription.rightEye?.axis || '-',
                    od_add: prescription.rightEye?.add || '-',
                    od_pd: prescription.rightEye?.pd || '-',
                    od_va: prescription.rightEye?.va || '-',
                    os_sph: prescription.leftEye?.sph || '0.00',
                    os_cyl: prescription.leftEye?.cyl || '0.00',
                    os_axis: prescription.leftEye?.axis || '-',
                    os_add: prescription.leftEye?.add || '-',
                    os_pd: prescription.leftEye?.pd || '-',
                    os_va: prescription.leftEye?.va || '-'
                  };
                  rxText = `Right Eye (OD): SPH: ${rxDetails.od_sph}, CYL: ${rxDetails.od_cyl}, AXIS: ${rxDetails.od_axis}, ADD: ${rxDetails.od_add}, PD: ${rxDetails.od_pd}, VA: ${rxDetails.od_va}
Left Eye (OS): SPH: ${rxDetails.os_sph}, CYL: ${rxDetails.os_cyl}, AXIS: ${rxDetails.os_axis}, ADD: ${rxDetails.os_add}, PD: ${rxDetails.os_pd}, VA: ${rxDetails.os_va}`;
                }
              } catch (rxErr) {
                console.warn('Could not load linked prescription:', rxErr);
              }
            }

            const messageText = `*LAB DISPATCH PRESCRIPTION ORDER*
---------------------------------------
Order Number: ${order.orderNumber}
Patient Name: ${populatedOrder.patientId?.name || 'N/A'}
Promised Date: ${order.promisedDate ? new Date(order.promisedDate).toLocaleDateString() : 'N/A'}

[FRAME DETAILS]
Brand: ${order.frameDetails?.brand || 'N/A'}
Model: ${order.frameDetails?.model || 'N/A'}
Color: ${order.frameDetails?.color || 'N/A'}
SKU: ${order.frameDetails?.sku || 'N/A'}

[LENS DETAILS]
Type: ${order.lensDetails?.type || 'N/A'}
Brand: ${order.lensDetails?.brand || 'N/A'}
Coating: ${order.lensDetails?.coating || 'N/A'}
SKU: ${order.lensDetails?.sku || 'N/A'}

[REFRACTION DIAGNOSTICS]
${rxText}

Remarks: ${order.remarks || 'N/A'}
---------------------------------------
${clinicText}---------------------------------------
Sent from Eyelitz CRM`;

            dispatchData = {
              messageText,
              phone: partner.phone,
              email: partner.email,
              name: partner.name,
              orderNumber: order.orderNumber,
              
              // Template values
              patient_name: populatedOrder.patientId?.name || 'N/A',
              promised_date: order.promisedDate ? new Date(order.promisedDate).toLocaleDateString() : 'N/A',
              
              frame_brand: order.frameDetails?.brand || 'N/A',
              frame_model: order.frameDetails?.model || 'N/A',
              frame_color: order.frameDetails?.color || 'N/A',
              frame_sku: order.frameDetails?.sku || 'N/A',
              
              lens_type: order.lensDetails?.type || 'N/A',
              lens_brand: order.lensDetails?.brand || 'N/A',
              lens_coating: order.lensDetails?.coating || 'N/A',
              lens_sku: order.lensDetails?.sku || 'N/A',
              
              ...rxDetails,
              
              remarks: order.remarks || 'N/A',
              
              clinic_name: store?.name || 'N/A',
              clinic_phone: store?.phone || 'N/A',
              clinic_email: store?.email || 'N/A',
              clinic_address: store?.address || 'N/A'
            };
          }
        }
      }

      order.orderStatus = orderStatus;
    }

    if (order.orderStatus !== 'cancelled' && amountPaid !== undefined) {
      const additionalPaid = Number(amountPaid) - order.amountPaid;
      order.amountPaid = Number(amountPaid);

      if (order.amountPaid >= order.finalAmount) {
        order.paymentStatus = 'paid';
      } else if (order.amountPaid > 0) {
        order.paymentStatus = 'partially-paid';
      } else {
        order.paymentStatus = 'unpaid';
      }

      // Sync corresponding invoice
      const invoice = await Invoice.findOne({ orderId: order._id, storeId: req.storeId });
      if (invoice) {
        invoice.status = order.paymentStatus === 'partially-paid' ? 'unpaid' : order.paymentStatus;
        invoice.amountPaid = order.amountPaid;
        invoice.balanceDue = Math.max(0, order.finalAmount - order.amountPaid);
        if (paymentMethod) {
          invoice.paymentMethod = paymentMethod;
        }
        if (order.paymentStatus === 'paid') {
          invoice.paymentDate = new Date();
        }
        await invoice.save();
      }
    }

    await order.save();

    res.json({
      success: true,
      order,
      dispatchData
    });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating order' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Owner only)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    await Invoice.deleteMany({ orderId: req.params.id, storeId: req.storeId });

    res.json({
      success: true,
      message: 'Order and associated invoices deleted successfully',
    });
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting order' });
  }
};
