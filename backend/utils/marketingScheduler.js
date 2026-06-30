import Store from '../models/Store.js';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import MarketingCampaign from '../models/MarketingCampaign.js';
import { sendWhatsAppMessage } from './whatsappGateway.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { 
  sendSubscriptionExpirationWarningEmail, 
  sendSubscriptionExpiredEmail 
} from './emailService.js';

// Helper to replace template fields
const formatMessage = (template, patientName, clinicName, extraLink = '') => {
  return template
    .replace(/\[Patient Name\]/gi, patientName)
    .replace(/\[Clinic Name\]/gi, clinicName)
    .replace(/\[Review Link\]/gi, extraLink);
};

let lastRunDate = ''; // Format: YYYY-MM-DD

export const runDailyCampaigns = async () => {
  try {
    console.log('[SCHEDULER]: Running daily automated marketing campaigns...');
    const stores = await Store.find({});
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const todayDateString = today.toISOString().split('T')[0];

    for (const store of stores) {
      // --- 1. BIRTHDAY WISHES ---
      if (store.birthdayWishesEnabled) {
        const birthdayPatients = await Patient.find({
          storeId: store._id,
          dob: { $ne: null }
        });

        const activeBirthdayPatients = birthdayPatients.filter(patient => {
          if (!patient.dob) return false;
          const d = new Date(patient.dob);
          return !isNaN(d.getTime()) && d.getMonth() + 1 === currentMonth && d.getDate() === currentDay;
        });

        for (const patient of activeBirthdayPatients) {
          // Prevent duplicate send today
          const alreadySent = await MarketingCampaign.findOne({
            storeId: store._id,
            patientId: patient._id,
            campaignType: 'birthday',
            sentAt: {
              $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            }
          });

          if (!alreadySent) {
            const rawMessage = store.birthdayTemplate || "Wish you a very Happy Birthday [Patient Name]! - [Clinic Name]";
            const formattedText = formatMessage(rawMessage, patient.name, store.name);
            
            console.log(`[SCHEDULER]: Sending Birthday Wish to ${patient.name}`);
            const gatewayResult = await sendWhatsAppMessage(store, patient.phone, formattedText);

            await MarketingCampaign.create({
              storeId: store._id,
              campaignType: 'birthday',
              patientId: patient._id,
              recipientName: patient.name,
              recipientPhone: patient.phone,
              message: formattedText,
              status: gatewayResult.success ? 'sent' : 'failed',
            });
          }
        }
      }

      // --- 2. ANNUAL CHECKUP REMINDERS ---
      if (store.checkupRemindersEnabled) {
        const oneYearAgo = new Date();
        oneYearAgo.setDate(oneYearAgo.getDate() - 365);

        // Find patients due for annual checkup
        const checkupDue = await Prescription.aggregate([
          { $match: { storeId: store._id } },
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
              email: '$patient.email'
            }
          }
        ]);

        for (const record of checkupDue) {
          // Prevent spamming: don't send reminder if one was sent in the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const alreadySentRecently = await MarketingCampaign.findOne({
            storeId: store._id,
            patientId: record._id,
            campaignType: 'annual-reminder',
            sentAt: { $gte: thirtyDaysAgo }
          });

          if (!alreadySentRecently) {
            const rawMessage = store.checkupTemplate || "Hello [Patient Name], it has been a year since your last eye checkup. Visit [Clinic Name] today.";
            const formattedText = formatMessage(rawMessage, record.name, store.name);

            console.log(`[SCHEDULER]: Sending Annual Checkup Reminder to ${record.name}`);
            const gatewayResult = await sendWhatsAppMessage(store, record.phone, formattedText);

            await MarketingCampaign.create({
              storeId: store._id,
              campaignType: 'annual-reminder',
              patientId: record._id,
              recipientName: record.name,
              recipientPhone: record.phone,
              message: formattedText,
              status: gatewayResult.success ? 'sent' : 'failed',
            });
          }
        }
      }
    }

    lastRunDate = todayDateString;
    console.log(`[SCHEDULER]: Marketing scheduler run completed for date: ${lastRunDate}`);
  } catch (error) {
    console.error('[SCHEDULER ERROR]: Failed running marketing scheduler:', error);
  }
};

export const checkSubscriptionExpirations = async () => {
  try {
    console.log('[SCHEDULER]: Running daily store subscription expiration checks...');
    const stores = await Store.find({});
    const today = new Date();

    for (const store of stores) {
      // Find the store owner
      const owner = await User.findOne({ storeId: store._id, role: 'owner' });
      if (!owner) {
        // No owner found, nothing to email
        continue;
      }

      // Expiry date depends on whether they are in trial (free plan) or active plan
      const expiryDate = store.subscriptionPlan === 'free' ? store.trialEndDate : store.subscriptionEndDate;
      if (!expiryDate) continue;

      const timeDiff = new Date(expiryDate).getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // 1. Check if expired
      if (daysDiff <= 0) {
        if (!store.expirationEmailSent) {
          console.log(`[SCHEDULER]: Store ${store.name} subscription expired today (${daysDiff} days). Sending email.`);
          store.subscriptionStatus = 'expired';
          store.expirationEmailSent = true;
          await store.save();

          await sendSubscriptionExpiredEmail(store, owner.name, owner.email);
        }
      } 
      // 2. Check if expiring in 1 day
      else if (daysDiff === 1) {
        if (!store.warningSent1Day) {
          console.log(`[SCHEDULER]: Store ${store.name} subscription expiring in 1 day. Sending email.`);
          store.warningSent1Day = true;
          await store.save();

          await sendSubscriptionExpirationWarningEmail(store, owner.name, owner.email, 1, expiryDate);
        }
      } 
      // 3. Check if expiring in 7 days
      else if (daysDiff === 7) {
        if (!store.warningSent7Days) {
          console.log(`[SCHEDULER]: Store ${store.name} subscription expiring in 7 days. Sending email.`);
          store.warningSent7Days = true;
          await store.save();

          await sendSubscriptionExpirationWarningEmail(store, owner.name, owner.email, 7, expiryDate);
        }
      }
    }
    console.log('[SCHEDULER]: Subscription expiration check completed.');
  } catch (error) {
    console.error('[SCHEDULER ERROR]: Failed checking subscription expirations:', error);
  }
};

export const startMarketingScheduler = () => {
  console.log('[SCHEDULER]: Marketing automation scheduler service initialized.');

  // Run a check every hour (3600000 ms)
  setInterval(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const todayDateString = now.toISOString().split('T')[0];

    // Trigger daily at 9:00 AM (Hour 9)
    if (currentHour === 9 && lastRunDate !== todayDateString) {
      runDailyCampaigns();
      checkSubscriptionExpirations();
    }
  }, 60000 * 30); // Checks every 30 minutes to make sure it doesn't miss the 9 AM hour slot
};
