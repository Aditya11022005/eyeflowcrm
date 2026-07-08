import LabPartner from '../models/LabPartner.js';
import Order from '../models/Order.js';
import Prescription from '../models/Prescription.js';
import LabDispatchLog from '../models/LabDispatchLog.js';
import Store from '../models/Store.js';

// @desc    Get all lab partners
// @route   GET /api/partners
// @access  Private
export const getLabPartners = async (req, res) => {
  try {
    const partners = await LabPartner.find({ storeId: req.storeId }).sort({ name: 1 });
    res.json({ success: true, partners });
  } catch (error) {
    console.error('Get Lab Partners Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving lab partners' });
  }
};

// @desc    Create a lab partner
// @route   POST /api/partners
// @access  Private (Owner/Staff)
export const createLabPartner = async (req, res) => {
  const { name, contactPerson, phone, email, address } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, message: 'Please provide name, phone and email' });
  }

  try {
    const partner = await LabPartner.create({
      storeId: req.storeId,
      name,
      contactPerson,
      phone,
      email,
      address
    });

    res.status(201).json({ success: true, partner });
  } catch (error) {
    console.error('Create Lab Partner Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating lab partner' });
  }
};

// @desc    Update lab partner details
// @route   PUT /api/partners/:id
// @access  Private (Owner/Staff)
export const updateLabPartner = async (req, res) => {
  const { name, contactPerson, phone, email, address, active } = req.body;

  try {
    let partner = await LabPartner.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Lab partner not found' });
    }

    partner.name = name !== undefined ? name : partner.name;
    partner.contactPerson = contactPerson !== undefined ? contactPerson : partner.contactPerson;
    partner.phone = phone !== undefined ? phone : partner.phone;
    partner.email = email !== undefined ? email : partner.email;
    partner.address = address !== undefined ? address : partner.address;
    partner.active = active !== undefined ? active : partner.active;

    await partner.save();

    res.json({ success: true, partner });
  } catch (error) {
    console.error('Update Lab Partner Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating lab partner' });
  }
};

// @desc    Delete a lab partner
// @route   DELETE /api/partners/:id
// @access  Private (Owner only)
export const deleteLabPartner = async (req, res) => {
  try {
    const partner = await LabPartner.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Lab partner not found' });
    }

    await LabPartner.findByIdAndDelete(req.params.id);

    // Update associated orders to set labPartnerId to null
    await Order.updateMany({ labPartnerId: req.params.id }, { labPartnerId: null });

    // Clean up dispatch logs
    await LabDispatchLog.deleteMany({ partnerId: req.params.id });

    res.json({ success: true, message: 'Lab partner removed successfully' });
  } catch (error) {
    console.error('Delete Lab Partner Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting lab partner' });
  }
};

// @desc    Get stats, orders and logs for a specific lab partner
// @route   GET /api/partners/:id/orders
// @access  Private
export const getLabPartnerOrders = async (req, res) => {
  try {
    const partner = await LabPartner.findOne({ _id: req.params.id, storeId: req.storeId });

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Lab partner not found' });
    }

    // Fetch all orders assigned to this lab partner, populate patient details
    const orders = await Order.find({ labPartnerId: req.params.id, storeId: req.storeId })
      .populate('patientId', 'name phone email')
      .sort({ updatedAt: -1 });

    // Fetch dispatch logs
    const logs = await LabDispatchLog.find({ partnerId: req.params.id, storeId: req.storeId })
      .populate('orderId', 'orderNumber')
      .sort({ sentAt: -1 });

    // Calculate metrics
    const totalOrdersCount = orders.length;
    const activeOrders = orders.filter(o => ['sent-to-lab', 'pending'].includes(o.orderStatus));
    const completedOrders = orders.filter(o => ['ready-for-pickup', 'delivered'].includes(o.orderStatus));
    const activeCount = activeOrders.length;
    const completedCount = completedOrders.length;

    res.json({
      success: true,
      partner,
      orders,
      logs,
      stats: {
        totalOrdersCount,
        activeCount,
        completedCount
      }
    });
  } catch (error) {
    console.error('Get Lab Partner Orders Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving lab partner orders' });
  }
};

// @desc    Dispatch order to lab partner (triggers system sending + saves log)
// @route   POST /api/partners/dispatch
// @access  Private (Owner/Staff)
export const dispatchOrder = async (req, res) => {
  const { orderId, partnerId, channel } = req.body;

  if (!orderId || !partnerId || !channel) {
    return res.status(400).json({ success: false, message: 'Please provide orderId, partnerId and channel' });
  }

  try {
    const partner = await LabPartner.findOne({ _id: partnerId, storeId: req.storeId });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Lab partner not found' });
    }

    const order = await Order.findOne({ _id: orderId, storeId: req.storeId }).populate('patientId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Generate ticket text
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
Patient Name: ${order.patientId?.name || 'N/A'}
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

    const recipient = channel === 'email' ? partner.email : partner.phone;

    // Save Dispatch Log
    const log = await LabDispatchLog.create({
      storeId: req.storeId,
      orderId,
      partnerId,
      channel,
      recipient,
      messageText,
      status: 'sent',
      sentAt: new Date()
    });

    // Update order status fields
    order.labPartnerId = partner._id;
    order.labSentDate = new Date();
    order.labDispatchChannel = channel;
    if (order.orderStatus === 'pending') {
      order.orderStatus = 'sent-to-lab';
    }
    await order.save();

    // Trigger sending simulation (or real API if configured)
    let systemStatus = 'Dispatched via System Simulator';
    
    // Brevo API call if configured
    if (channel === 'email' && process.env.BREVO_API_KEY && process.env.BREVO_API_KEY !== 'your_brevo_api_key_here') {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: {
              name: process.env.BREVO_SENDER_NAME || 'Eyelitz CRM',
              email: process.env.BREVO_SENDER_EMAIL || 'noreply@eyelitz.com'
            },
            to: [{ email: partner.email, name: partner.name }],
            subject: `Optical Lab Prescription Dispatch - ${order.orderNumber}`,
            htmlContent: `<h3>Lab Order Ticket</h3><pre>${messageText}</pre>`
          })
        });
        if (response.ok) {
          systemStatus = 'Dispatched via Brevo SMTP Server';
        }
      } catch (err) {
        console.error('Brevo Direct Send Error:', err);
      }
    }

    res.json({
      success: true,
      log,
      systemStatus,
      dispatchData: {
        messageText,
        phone: partner.phone,
        email: partner.email,
        name: partner.name,
        orderNumber: order.orderNumber,
        
        // Template values
        patient_name: order.patientId?.name || 'N/A',
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
      }
    });
  } catch (error) {
    console.error('Dispatch Order Error:', error);
    res.status(500).json({ success: false, message: 'Server error dispatching lab order' });
  }
};
