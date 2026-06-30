/**
 * Mock email service. All email functionalities are disabled.
 * Functions return a mock success response immediately to prevent side-effects.
 */

export const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  return { success: true, mode: 'disabled' };
};

export const sendVerificationEmail = async (user, code) => {
  return { success: true, mode: 'disabled' };
};

export const sendForgotPasswordEmail = async (user, code) => {
  console.log(`\n🔑 [PASSWORD RESET CODE]: User ${user.email} reset OTP is: ${code}\n`);
  return { success: true, mode: 'disabled' };
};

export const sendSubscriptionSuccessEmail = async (store, ownerName, ownerEmail, planName, amount, expiryDate) => {
  return { success: true, mode: 'disabled' };
};

export const sendSubscriptionExpirationWarningEmail = async (store, ownerName, ownerEmail, daysRemaining, expiryDate) => {
  return { success: true, mode: 'disabled' };
};

export const sendSubscriptionExpiredEmail = async (store, ownerName, ownerEmail) => {
  return { success: true, mode: 'disabled' };
};
