import dotenv from 'dotenv';
dotenv.config();

/**
 * Generic email sending function using Brevo REST API.
 * Falls back to printing formatted HTML emails to the console in development if no API key is set.
 */
export const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@eyelitz.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Eyelitz CRM';

  if (!apiKey) {
    console.log('\n========================================================================');
    console.log(`✉️  [EMAIL SERVICE - DEV FALLBACK]: Sending Email`);
    console.log(`👉 To: ${toName} <${toEmail}>`);
    console.log(`👉 Subject: ${subject}`);
    console.log('------------------------------------------------------------------------');
    // Strip simple tags or display code in a clean way for terminal preview
    const cleanBody = htmlContent
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\n+/g, '\n')
      .trim();
    console.log(cleanBody.substring(0, 800) + (cleanBody.length > 800 ? '\n... (truncated for preview)' : ''));
    console.log('========================================================================\n');
    return { success: true, mode: 'console' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: toName }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Brevo API request failed');
    }
    
    console.log(`[EMAIL SERVICE]: Email sent to ${toEmail} via Brevo. Message ID: ${data.messageId}`);
    return { success: true, messageId: data.messageId, mode: 'api' };
  } catch (error) {
    console.error('[EMAIL SERVICE ERROR]: Failed sending email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Base template generator to ensure uniform styling across all emails
 */
const getBaseTemplate = ({ title, bodyContent }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background: linear-gradient(135deg, #0d9488 0%, #0d9488 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;
      margin: 25px 0;
      text-align: center;
      box-shadow: 0 4px 6px rgba(13, 148, 136, 0.2);
    }
    .otp-code {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 6px;
      color: #0f172a;
      background-color: #f1f5f9;
      padding: 12px 24px;
      border-radius: 8px;
      display: inline-block;
      margin: 20px 0;
      border: 1px dashed #cbd5e1;
    }
    .alert-box {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
      color: #991b1b;
      font-weight: 500;
    }
    .info-list {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border: 1px solid #e2e8f0;
      list-style-type: none;
    }
    .info-list li {
      margin-bottom: 10px;
      font-size: 14px;
    }
    .info-list li:last-child {
      margin-bottom: 0;
    }
    .info-label {
      font-weight: 700;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Eyelitz CRM</h1>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Eyelitz CRM. All rights reserved.</p>
        <p>This is an automated operational email. Please do not reply directly.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send email verification code
 */
export const sendVerificationEmail = async (user, code) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email?code=${code}&email=${encodeURIComponent(user.email)}`;

  const bodyContent = `
    <h2>Welcome, ${user.name}!</h2>
    <p>Thank you for signing up with Eyelitz CRM. To complete your registration and verify your email address, please use the 6-digit OTP code below:</p>
    <div style="text-align: center;">
      <div class="otp-code">${code}</div>
    </div>
    <p>Alternatively, you can verify your email directly by clicking the button below:</p>
    <div style="text-align: center;">
      <a href="${verificationLink}" class="button" target="_blank">Verify Email Address</a>
    </div>
    <p style="font-size: 13px; color: #64748b;">This OTP code and verification link are valid for 24 hours. If you did not create an Eyelitz account, please ignore this email.</p>
  `;

  const html = getBaseTemplate({ title: 'Verify Your Email Address', bodyContent });
  return await sendEmail({
    toEmail: user.email,
    toName: user.name,
    subject: '🔐 Verify Your Eyelitz CRM Account',
    htmlContent: html
  });
};

/**
 * Send password reset email
 */
export const sendForgotPasswordEmail = async (user, code) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?code=${code}&email=${encodeURIComponent(user.email)}`;

  const bodyContent = `
    <h2>Password Reset Request</h2>
    <p>Hello ${user.name},</p>
    <p>We received a request to reset the password associated with your account. Please use the following 6-digit OTP code to complete the reset:</p>
    <div style="text-align: center;">
      <div class="otp-code">${code}</div>
    </div>
    <p>Or click the button below to reset your password directly:</p>
    <div style="text-align: center;">
      <a href="${resetLink}" class="button" target="_blank">Reset Password</a>
    </div>
    <p style="font-size: 13px; color: #64748b;">This code and reset link are valid for 1 hour. If you did not make this request, you can safely ignore this email; your password will remain unchanged.</p>
  `;

  const html = getBaseTemplate({ title: 'Reset Your Password', bodyContent });
  return await sendEmail({
    toEmail: user.email,
    toName: user.name,
    subject: '🔑 Reset Your Eyelitz CRM Password',
    htmlContent: html
  });
};

/**
 * Send subscription purchase confirmation email
 */
export const sendSubscriptionSuccessEmail = async (store, ownerName, ownerEmail, planName, amount, expiryDate) => {
  const bodyContent = `
    <h2>Subscription Activated! 🎉</h2>
    <p>Hello ${ownerName},</p>
    <p>Thank you for purchasing a subscription plan for your clinic, <strong>${store.name}</strong>. Your subscription has been successfully processed and activated.</p>
    
    <div class="info-list">
      <h3>Subscription Details:</h3>
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td class="info-label" style="padding: 6px 0;">Clinic Name:</td>
          <td>${store.name}</td>
        </tr>
        <tr>
          <td class="info-label" style="padding: 6px 0;">Active Plan:</td>
          <td style="text-transform: capitalize;">${planName} Plan</td>
        </tr>
        <tr>
          <td class="info-label" style="padding: 6px 0;">Paid Amount:</td>
          <td>₹${amount}</td>
        </tr>
        <tr>
          <td class="info-label" style="padding: 6px 0;">Valid Until:</td>
          <td>${new Date(expiryDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</td>
        </tr>
        <tr>
          <td class="info-label" style="padding: 6px 0;">Status:</td>
          <td><span style="background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Active</span></td>
        </tr>
      </table>
    </div>
    
    <p>You now have full access to all Eyelitz features, including clinic management, inventory tracking, electronic checkups, analytics, and automated marketing campaigns.</p>
    <p>If you have any questions or require assistance, please feel free to reach out to our support team.</p>
  `;

  const html = getBaseTemplate({ title: 'Subscription Activated', bodyContent });
  return await sendEmail({
    toEmail: ownerEmail,
    toName: ownerName,
    subject: '💳 Subscription Activated - Eyelitz CRM',
    htmlContent: html
  });
};

/**
 * Send subscription warning email
 */
export const sendSubscriptionExpirationWarningEmail = async (store, ownerName, ownerEmail, daysRemaining, expiryDate) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const renewLink = `${frontendUrl}/dashboard?tab=billing`; // Assuming billing tab exists on dashboard

  const bodyContent = `
    <h2>Action Required: Subscription Expiring Soon</h2>
    <p>Hello ${ownerName},</p>
    <p>This is a friendly reminder that the subscription plan for your clinic, <strong>${store.name}</strong>, is expiring in <strong>${daysRemaining} day${daysRemaining > 1 ? 's' : ''}</strong> on <strong>${new Date(expiryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</strong>.</p>
    
    <div class="alert-box">
      ⚠️ To prevent any interruption in your staff and doctor work operations, please renew your subscription before the expiration date.
    </div>

    <div style="text-align: center;">
      <a href="${renewLink}" class="button" target="_blank">Renew Subscription Now</a>
    </div>

    <p>If your subscription expires, your clinic's database access will be temporarily locked until a new plan is active.</p>
    <p>Thank you for choosing Eyelitz CRM to manage your workspace!</p>
  `;

  const html = getBaseTemplate({ title: 'Subscription Expiring Soon', bodyContent });
  return await sendEmail({
    toEmail: ownerEmail,
    toName: ownerName,
    subject: `⚠️ Urgent: Subscription Expiring in ${daysRemaining} Day${daysRemaining > 1 ? 's' : ''} - Eyelitz CRM`,
    htmlContent: html
  });
};

/**
 * Send subscription expired email
 */
export const sendSubscriptionExpiredEmail = async (store, ownerName, ownerEmail) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const renewLink = `${frontendUrl}/dashboard?tab=billing`;

  const bodyContent = `
    <h2 style="color: #ef4444;">Your Subscription Has Expired</h2>
    <p>Hello ${ownerName},</p>
    <p>We want to inform you that the subscription/trial plan for your clinic, <strong>${store.name}</strong>, expired on <strong>${new Date(store.subscriptionEndDate || store.trialEndDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</strong>.</p>
    
    <div class="alert-box">
      🚫 Your access is currently restricted. Your staff and doctors will not be able to log in or manage patients, prescriptions, or inventory until the subscription is renewed.
    </div>

    <p>Don't worry, your data is safe with us! You can restore immediate access to your workspace by renewing your plan using the button below:</p>

    <div style="text-align: center;">
      <a href="${renewLink}" class="button" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);" target="_blank">Renew Subscription Now</a>
    </div>

    <p>Thank you, and we hope to see you back on Eyelitz CRM soon!</p>
  `;

  const html = getBaseTemplate({ title: 'Subscription Expired', bodyContent });
  return await sendEmail({
    toEmail: ownerEmail,
    toName: ownerName,
    subject: '🚫 Access Suspended: Subscription Expired - Eyelitz CRM',
    htmlContent: html
  });
};
