import Store from '../models/Store.js';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import MarketingCampaign from '../models/MarketingCampaign.js';
import mongoose from 'mongoose';
import { sendWhatsAppMessage } from '../utils/whatsappGateway.js';

// Helper to replace template fields
const formatMessage = (template, patientName, clinicName, extraLink = '') => {
  return template
    .replace(/\[Patient Name\]/gi, patientName)
    .replace(/\[Clinic Name\]/gi, clinicName)
    .replace(/\[Review Link\]/gi, extraLink);
};

// @desc    Get marketing configs, today's targets, and logs
// @route   GET /api/marketing/dashboard
// @access  Private
export const getMarketingDashboard = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-indexed
    const currentDay = today.getDate();

    // 1. Get today's birthdays (month and day matches today)
    const allPatientsWithDob = await Patient.find({
      storeId: req.storeId,
      dob: { $ne: null }
    }).select('name phone email dob loyaltyPoints');

    const birthdaysToday = allPatientsWithDob.filter(patient => {
      if (!patient.dob) return false;
      const d = new Date(patient.dob);
      // Verify it's a valid date
      if (isNaN(d.getTime())) return false;
      return d.getMonth() + 1 === currentMonth && d.getDate() === currentDay;
    });

    // 2. Get today's wedding anniversaries
    const allPatientsWithAnniversary = await Patient.find({
      storeId: req.storeId,
      anniversaryDate: { $ne: null }
    }).select('name phone email anniversaryDate loyaltyPoints');

    const anniversariesToday = allPatientsWithAnniversary.filter(patient => {
      if (!patient.anniversaryDate) return false;
      const d = new Date(patient.anniversaryDate);
      // Verify it's a valid date
      if (isNaN(d.getTime())) return false;
      return d.getMonth() + 1 === currentMonth && d.getDate() === currentDay;
    });

    // 3. Get patients due for annual checkup (latest prescription older than 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const storeIdObj = typeof req.storeId === 'string' 
      ? new mongoose.Types.ObjectId(req.storeId) 
      : req.storeId;

    const checkupDue = await Prescription.aggregate([
      { $match: { storeId: storeIdObj } },
      { $sort: { checkupDate: -1 } },
      {
        $group: {
          _id: '$patientId',
          latestCheckup: { $first: '$checkupDate' }
        }
      },
      { $match: { latestCheckup: { $lt: oneYearAgo } } },
      {
        $lookup: {
          from: 'patients',
          localField: '_id',
          foreignField: '_id',
          as: 'patient'
        }
      },
      { $unwind: '$patient' },
      {
        $project: {
          _id: 1,
          latestCheckup: 1,
          name: '$patient.name',
          phone: '$patient.phone',
          email: '$patient.email',
          loyaltyPoints: '$patient.loyaltyPoints'
        }
      }
    ]);

    // 4. Get recent campaign logs
    const logs = await MarketingCampaign.find({ storeId: req.storeId })
      .sort({ sentAt: -1 })
      .limit(100);

    res.json({
      success: true,
      config: {
        loyaltyPointsEnabled: store.loyaltyPointsEnabled,
        pointsPerRupee: store.pointsPerRupee,
        pointValueInRupees: store.pointValueInRupees,
        birthdayWishesEnabled: store.birthdayWishesEnabled,
        birthdayTemplate: store.birthdayTemplate,
        checkupRemindersEnabled: store.checkupRemindersEnabled,
        checkupTemplate: store.checkupTemplate,
        googleReviewEnabled: store.googleReviewEnabled,
        googleReviewLink: store.googleReviewLink,
        googleReviewTemplate: store.googleReviewTemplate,
        whatsappGatewayProvider: store.whatsappGatewayProvider || 'none',
        whatsappGatewayInstanceId: store.whatsappGatewayInstanceId || '',
        whatsappGatewayToken: store.whatsappGatewayToken || '',
      },
      birthdaysToday,
      anniversariesToday,
      checkupDue,
      logs,
    });
  } catch (error) {
    console.error('Get Marketing Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error loading marketing dashboard' });
  }
};

// @desc    Update Marketing Configurations
// @route   PUT /api/marketing/config
// @access  Private
export const updateMarketingConfig = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const {
      loyaltyPointsEnabled,
      pointsPerRupee,
      pointValueInRupees,
      birthdayWishesEnabled,
      birthdayTemplate,
      checkupRemindersEnabled,
      checkupTemplate,
      googleReviewEnabled,
      googleReviewLink,
      googleReviewTemplate,
      whatsappGatewayProvider,
      whatsappGatewayInstanceId,
      whatsappGatewayToken
    } = req.body;

    if (loyaltyPointsEnabled !== undefined) store.loyaltyPointsEnabled = loyaltyPointsEnabled;
    if (pointsPerRupee !== undefined) store.pointsPerRupee = pointsPerRupee;
    if (pointValueInRupees !== undefined) store.pointValueInRupees = pointValueInRupees;
    if (birthdayWishesEnabled !== undefined) store.birthdayWishesEnabled = birthdayWishesEnabled;
    if (birthdayTemplate !== undefined) store.birthdayTemplate = birthdayTemplate;
    if (checkupRemindersEnabled !== undefined) store.checkupRemindersEnabled = checkupRemindersEnabled;
    if (checkupTemplate !== undefined) store.checkupTemplate = checkupTemplate;
    if (googleReviewEnabled !== undefined) store.googleReviewEnabled = googleReviewEnabled;
    if (googleReviewLink !== undefined) store.googleReviewLink = googleReviewLink;
    if (googleReviewTemplate !== undefined) store.googleReviewTemplate = googleReviewTemplate;
    if (whatsappGatewayProvider !== undefined) store.whatsappGatewayProvider = whatsappGatewayProvider;
    if (whatsappGatewayInstanceId !== undefined) store.whatsappGatewayInstanceId = whatsappGatewayInstanceId;
    if (whatsappGatewayToken !== undefined) store.whatsappGatewayToken = whatsappGatewayToken;

    await store.save();

    res.json({
      success: true,
      message: 'Marketing settings updated successfully',
      config: {
        loyaltyPointsEnabled: store.loyaltyPointsEnabled,
        pointsPerRupee: store.pointsPerRupee,
        pointValueInRupees: store.pointValueInRupees,
        birthdayWishesEnabled: store.birthdayWishesEnabled,
        birthdayTemplate: store.birthdayTemplate,
        checkupRemindersEnabled: store.checkupRemindersEnabled,
        checkupTemplate: store.checkupTemplate,
        googleReviewEnabled: store.googleReviewEnabled,
        googleReviewLink: store.googleReviewLink,
        googleReviewTemplate: store.googleReviewTemplate,
        whatsappGatewayProvider: store.whatsappGatewayProvider || 'none',
        whatsappGatewayInstanceId: store.whatsappGatewayInstanceId || '',
        whatsappGatewayToken: store.whatsappGatewayToken || '',
      }
    });
  } catch (error) {
    console.error('Update Marketing Config Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating marketing configurations' });
  }
};

// @desc    Trigger/Send Campaign Messages (Simulated SMS/WhatsApp)
// @route   POST /api/marketing/trigger
// @access  Private
export const triggerCampaign = async (req, res) => {
  const { campaignType, patientIds, customMessage, googleLink } = req.body;

  try {
    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No patient selected' });
    }

    const patients = await Patient.find({ _id: { $in: patientIds }, storeId: req.storeId });
    const logs = [];

    for (const patient of patients) {
      // Determine what message to send
      let rawMessage = customMessage || '';
      if (!rawMessage) {
        if (campaignType === 'birthday') rawMessage = store.birthdayTemplate;
        else if (campaignType === 'anniversary') rawMessage = "Dear [Patient Name], wishing you a very Happy Anniversary! Have a great day ahead. - [Clinic Name]";
        else if (campaignType === 'annual-reminder') rawMessage = store.checkupTemplate;
        else if (campaignType === 'google-review') rawMessage = store.googleReviewTemplate;
        else rawMessage = "Hello [Patient Name], thank you for choosing [Clinic Name]!";
      }

      const link = googleLink || store.googleReviewLink || '';
      const formattedText = formatMessage(rawMessage, patient.name, store.name, link);

      // Send actual message via configured WhatsApp Gateway
      const gatewayResult = await sendWhatsAppMessage(store, patient.phone, formattedText);

      // Save campaign log
      const log = await MarketingCampaign.create({
        storeId: req.storeId,
        campaignType,
        patientId: patient._id,
        recipientName: patient.name,
        recipientPhone: patient.phone,
        message: formattedText,
        status: gatewayResult.success ? 'sent' : 'failed',
      });

      logs.push(log);
    }

    res.json({
      success: true,
      message: `Campaign executed successfully. Sent to ${patients.length} patients.`,
      logs,
    });
  } catch (error) {
    console.error('Trigger Campaign Error:', error);
    res.status(500).json({ success: false, message: 'Server error triggering campaign' });
  }
};
