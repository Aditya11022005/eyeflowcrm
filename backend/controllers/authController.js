import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Store from '../models/Store.js';
import { sendVerificationEmail, sendForgotPasswordEmail } from '../utils/emailService.js';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eyelitz_jwt_secret_key_123456', {
    expiresIn: '30d',
  });
};

// @desc    Register a new Store and its Owner
// @route   POST /api/auth/signup
// @access  Public
export const registerStore = async (req, res) => {
  const { storeName, storeSlug, email, phone, address, ownerName, password } = req.body;

  try {
    // Check if store slug already exists
    const slugExists = await Store.findOne({ slug: storeSlug.toLowerCase() });
    if (slugExists) {
      return res.status(400).json({ success: false, message: 'Store URL slug is already taken' });
    }

    // Check if user email already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Create the Store (tenant)
    const store = await Store.create({
      name: storeName,
      slug: storeSlug.toLowerCase(),
      email,
      phone,
      address,
    });

    // Create the Owner User (Auto-verified)
    const user = await User.create({
      storeId: store._id,
      name: ownerName,
      email: email.toLowerCase(),
      password,
      role: 'owner',
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Eyeflow CRM.',
      needsVerification: false,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      },
      store,
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during onboarding' });
  }
};

// @desc    Authenticate User & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email and select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Automatically verify user if not already verified (disables verification screens)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Load store info if user has a store
    let store = null;
    if (user.storeId) {
      store = await Store.findById(user.storeId);
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      },
      store,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};

// @desc    Get user profile & store info
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let store = null;
    if (user.storeId) {
      store = await Store.findById(user.storeId);
    }

    res.json({
      success: true,
      user,
      store,
    });
  } catch (error) {
    console.error('getMe Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

// @desc    Add staff/doctor account by owner
// @route   POST /api/auth/staff
// @access  Private (Owner only)
export const addStaff = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  try {
    if (!['doctor', 'staff'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified for staff member' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const staffUser = await User.create({
      storeId: req.storeId,
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      isVerified: true, // Staff accounts are verified automatically by their clinic owner
    });

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      staff: {
        _id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        phone: staffUser.phone,
      },
    });
  } catch (error) {
    console.error('Add Staff Error:', error);
    res.status(500).json({ success: false, message: 'Server error adding staff member' });
  }
};

// @desc    List all staff inside the clinic
// @route   GET /api/auth/staff
// @access  Private (Owner/Doctor/Staff)
export const getStaffList = async (req, res) => {
  try {
    const staff = await User.find({ storeId: req.storeId });
    res.json({
      success: true,
      staff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error listing staff' });
  }
};

// @desc    Update Owner or User profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email address is already taken' });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// @desc    Update Store details (Owner only)
// @route   PUT /api/auth/store
// @access  Private (Owner only)
export const updateStore = async (req, res) => {
  const { name, phone, email, address, logo, eyeCheckupFee, invoiceTerms, emailjsServiceId, emailjsTemplateId, emailjsPublicKey } = req.body;
  try {
    if (!req.storeId) {
      return res.status(400).json({ success: false, message: 'No store associated with this user' });
    }

    const store = await Store.findById(req.storeId);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    if (name) store.name = name;
    if (phone) store.phone = phone;
    if (email) store.email = email;
    if (address !== undefined) store.address = address;
    if (logo !== undefined) store.logo = logo;
    if (eyeCheckupFee !== undefined) store.eyeCheckupFee = Number(eyeCheckupFee) || 0;
    if (invoiceTerms !== undefined) store.invoiceTerms = invoiceTerms;
    if (emailjsServiceId !== undefined) store.emailjsServiceId = emailjsServiceId;
    if (emailjsTemplateId !== undefined) store.emailjsTemplateId = emailjsTemplateId;
    if (emailjsPublicKey !== undefined) store.emailjsPublicKey = emailjsPublicKey;

    await store.save();

    res.json({
      success: true,
      message: 'Store settings updated successfully',
      store,
    });
  } catch (error) {
    console.error('Update Store Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating store settings' });
  }
};

// @desc    Verify User Email via 6-digit OTP code or direct link
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (new Date(user.verificationExpires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;
    await user.save();

    // Fetch store info
    let store = null;
    if (user.storeId) {
      store = await Store.findById(user.storeId);
    }

    res.json({
      success: true,
      message: 'Email verified successfully!',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: user.storeId,
      },
      store,
    });
  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying email' });
  }
};

// @desc    Resend Email Verification Code
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = otpCode;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, otpCode);

    res.json({
      success: true,
      message: 'A new verification email has been sent to your registered address.',
    });
  } catch (error) {
    console.error('Resend Verification Error:', error);
    res.status(500).json({ success: false, message: 'Server error sending verification code' });
  }
};

// @desc    Forgot Password - request verification code
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't leak registered emails, but say sent if the flow succeeds
      return res.json({
        success: true,
        message: 'If the email is registered on our system, a password reset link has been sent.',
      });
    }

    // Generate 6-digit reset OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email
    await sendForgotPasswordEmail(user, resetCode);

    res.json({
      success: true,
      message: 'If the email is registered on our system, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing password recovery' });
  }
};

// @desc    Reset Password using Code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields (email, code, new password) are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.passwordResetCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid reset code' });
    }

    if (new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new code.' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    
    // Auto-verify if they were somehow unverified
    if (!user.isVerified) {
      user.isVerified = true;
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};
