const User = require("../models/User");
const Profile = require("../models/Profile");
const Subscription = require("../models/Subscription");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const transporter = require("../utils/emailConfig");
const { notifyAllAdmins } = require("../utils/notificationHelper");
// Generate Token Utility
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_SCOPE = "openid email profile";

const buildFrontendRedirectUrl = ({
  callbackUrl,
  token,
  user,
  isNewUser,
  redirect,
  error,
}) => {
  const frontendUrl = new URL(callbackUrl);

  if (error) {
    frontendUrl.searchParams.set("error", error);
  } else {
    frontendUrl.searchParams.set("token", token);
    frontendUrl.searchParams.set("user", JSON.stringify(user));
    frontendUrl.searchParams.set("isNewUser", String(isNewUser));
  }

  if (redirect) {
    frontendUrl.searchParams.set("redirect", redirect);
  }

  return frontendUrl.toString();
};

const createGoogleState = ({ callbackUrl, redirect }) =>
  jwt.sign({ callbackUrl, redirect: redirect || "" }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

const parseGoogleState = (state) =>
  jwt.verify(state, process.env.JWT_SECRET);

const bootstrapUserResources = async (user, language = "English") => {
  const profile = await Profile.findOne({ userId: user._id });
  const isNewUser = !profile || !profile.fullName;

  if (!profile) {
    user.accountStatus = "active";

    const createdProfile = await Profile.create({
      userId: user._id,
      adminStatus: "pending",
      membershipType: "Free",
      language,
    });

    await Subscription.create({
      userId: user._id,
      planName: "Free",
      amount: 0,
      billingCycle: "LIFETIME",
      features: {
        browseProfiles: true,
        shortlistProfiles: true,
        sendInterests: "LIMITED",
        chatMessaging: "NONE",
      },
    });

    const userLabel = user.email || user.phone || "A new user";
    await notifyAllAdmins({
      senderId: user._id,
      title: "New approval request",
      description: `${userLabel} sent you an approval request.`,
      relatedId: createdProfile._id,
    });
  }

  return { profile, isNewUser };
};

const buildAuthUserPayload = (user) => ({
  id: user._id,
  email: user.email,
  phone: user.phone,
  fullName: user.fullName,
  profileImage: user.profileImage,
  authProvider: user.authProvider,
});

const requireGoogleOAuthConfig = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth is not configured.");
  } 
};

const validateFrontendCallbackUrl = (callbackUrl) => {
  const parsedCallbackUrl = new URL(callbackUrl);
  const allowedOrigins = (process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (
    allowedOrigins.length > 0 &&
    !allowedOrigins.includes(parsedCallbackUrl.origin)
  ) {
    throw new Error("callbackUrl origin is not allowed.");
  }

  return parsedCallbackUrl;
};

const buildOtpEmail = (email, otp) => ({
  from: `"RVR Luxury Matrimony" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: `${otp} is your verification code`,
  html: `
                <div style="background-color: #f9f9f9; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #eef0f2;">
                        
                        <div style="background: linear-gradient(135deg, #004d00 0%, #006400 100%); padding: 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 600;">RVR LUXURY MATRIMONY</h1>
                        </div>

                        <div style="padding: 25px; text-align: center; color: #333333;">
                            <h2 style="margin-top: 0; color: #1a1a1a; font-size: 22px;">Verification Code</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #555555;">To complete your secure login, please use the following One-Time Password (OTP). This code is valid for the next 10 minutes.</p>
                            
                            <div style="margin: 30px 0; padding: 20px; background-color: #f0f4f0; border-radius: 12px; display: inline-block; border: 1px dashed #004d00;">
                                <span style="font-size: 40px; font-weight: bold; color: #f1a10a; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                            </div>

                            <p style="font-size: 14px; color: #888888;">If you did not request this code, please ignore this email or contact our support team.</p>
                        </div>

                        <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; font-size: 12px; color: #999999;">&copy; 2026 RVR Luxury Matrimony. All rights reserved.</p>
                         
                        </div>
                    </div>
                </div>
                `,
});

const buildPhoneOtpResponseMessage = () =>
  "A verification code has been sent to your phone number. (Use 123456)";

const clearPendingPhoneVerification = (user) => {
  user.pendingPhone = undefined;
  user.pendingPhoneOtp = undefined;
  user.pendingPhoneOtpExpires = undefined;
  user.pendingPhoneLastOtpSentAt = undefined;
};

const clearPendingEmailVerification = (user) => {
  user.pendingEmail = undefined;
  user.pendingEmailOtp = undefined;
  user.pendingEmailOtpExpires = undefined;
  user.pendingEmailLastOtpSentAt = undefined;
};

// @desc    Send OTP to Email or Phone
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone number is required.",
      });
    }

    const query = email ? { email } : { phone };
    let user = await User.findOne(query);

    // Rate Limiting Check
    const RESEND_DELAY = 1 * 30 * 1000;
    if (user && user.lastOtpSentAt) {
      const timePassed = Date.now() - new Date(user.lastOtpSentAt).getTime();
      if (timePassed < RESEND_DELAY) {
        const waitTime = Math.ceil((RESEND_DELAY - timePassed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new OTP.`,
        });
      }
    }

    // OTP Generation
    let otp = phone
      ? "123456"
      : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (!user) {
      user = new User({ ...query, membershipType: "Free" });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.lastOtpSentAt = new Date();
    await user.save();

    if (email) {
      await transporter.sendMail(buildOtpEmail(email, otp));
    }
 
    res.status(200).json({
      success: true,
      message: email
        ? "A verification code has been sent to your email address."
        : buildPhoneOtpResponseMessage(),
    });
  } catch (error) {
    console.error("Email Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during OTP delivery." });
  }
};

// @desc    Send OTP only for existing users who want to log in
// @route   POST /api/auth/login/send-otp
exports.sendLoginOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone number is required.",
      });
    }

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found. Please register first.",
      });
    }

    const RESEND_DELAY = 1 * 30 * 1000;
    if (user.lastOtpSentAt) {
      const timePassed = Date.now() - new Date(user.lastOtpSentAt).getTime();
      if (timePassed < RESEND_DELAY) {
        const waitTime = Math.ceil((RESEND_DELAY - timePassed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new OTP.`,
        });
      }
    }

    const otp = phone
      ? "123456"
      : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.lastOtpSentAt = new Date();
    await user.save();

    if (email) {
      await transporter.sendMail(buildOtpEmail(email, otp));
    }

    return res.status(200).json({
      success: true,
      message: email
        ? "A verification code has been sent to your email address."
        : buildPhoneOtpResponseMessage(),
    });
  } catch (error) {
    console.error("Login OTP Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during OTP delivery." });
  }
};

// @desc    Send OTP to add/update phone for logged-in user
// @route   POST /api/auth/phone/send-otp
// @access  Private
exports.sendPhoneUpdateOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    const normalizedPhone = phone.trim();
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingPhoneOwner = await User.findOne({
      phone: normalizedPhone,
      _id: { $ne: user._id },
    });

    if (existingPhoneOwner) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already linked to another account.",
      });
    }

    const RESEND_DELAY = 1 * 30 * 1000;
    if (
      user.pendingPhone === normalizedPhone &&
      user.pendingPhoneLastOtpSentAt
    ) {
      const timePassed =
        Date.now() - new Date(user.pendingPhoneLastOtpSentAt).getTime();
      if (timePassed < RESEND_DELAY) {
        const waitTime = Math.ceil((RESEND_DELAY - timePassed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new OTP.`,
        });
      }
    }

    user.pendingPhone = normalizedPhone;
    user.pendingPhoneOtp = "123456";
    user.pendingPhoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.pendingPhoneLastOtpSentAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: buildPhoneOtpResponseMessage(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify OTP and save updated phone for logged-in user
// @route   POST /api/auth/phone/verify-otp
// @access  Private
exports.verifyPhoneUpdateOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!otp || !String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    const normalizedPhone = phone.trim();
    const normalizedOtp = String(otp).trim();
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (
      !user.pendingPhone ||
      user.pendingPhone !== normalizedPhone ||
      !user.pendingPhoneOtp
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP not requested for this phone number.",
      });
    }

    if (user.pendingPhoneOtp !== normalizedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code.",
      });
    }

    if (user.pendingPhoneOtpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "This OTP has expired.",
      });
    }

    const existingPhoneOwner = await User.findOne({
      phone: normalizedPhone,
      _id: { $ne: user._id },
    });

    if (existingPhoneOwner) {
      return res.status(409).json({
        success: false,
        message: "This phone number is already linked to another account.",
      });
    }

    user.phone = normalizedPhone;
    clearPendingPhoneVerification(user);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Phone number verified and updated successfully.",
      user: buildAuthUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send OTP to add/update email for logged-in user
// @route   POST /api/auth/email/send-otp
// @access  Private
exports.sendEmailUpdateOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const existingEmailOwner = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (existingEmailOwner) {
      return res.status(409).json({
        success: false,
        message: "This email is already linked to another account.",
      });
    }

    const RESEND_DELAY = 1 * 30 * 1000;
    if (
      user.pendingEmail === normalizedEmail &&
      user.pendingEmailLastOtpSentAt
    ) {
      const timePassed =
        Date.now() - new Date(user.pendingEmailLastOtpSentAt).getTime();
      if (timePassed < RESEND_DELAY) {
        const waitTime = Math.ceil((RESEND_DELAY - timePassed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new OTP.`,
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.pendingEmail = normalizedEmail;
    user.pendingEmailOtp = otp;
    user.pendingEmailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.pendingEmailLastOtpSentAt = new Date();
    await user.save();

    await transporter.sendMail(buildOtpEmail(normalizedEmail, otp));

    return res.status(200).json({
      success: true,
      message: "A verification code has been sent to your email address.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify OTP and save updated email for logged-in user
// @route   POST /api/auth/email/verify-otp
// @access  Private
exports.verifyEmailUpdateOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!otp || !String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = String(otp).trim();
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (
      !user.pendingEmail ||
      user.pendingEmail !== normalizedEmail ||
      !user.pendingEmailOtp
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP not requested for this email address.",
      });
    }

    if (user.pendingEmailOtp !== normalizedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code.",
      });
    }

    if (user.pendingEmailOtpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "This OTP has expired.",
      });
    }

    const existingEmailOwner = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (existingEmailOwner) {
      return res.status(409).json({
        success: false,
        message: "This email is already linked to another account.",
      });
    }

    user.email = normalizedEmail;
    clearPendingEmailVerification(user);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified and updated successfully.",
      user: buildAuthUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// @desc    Verify OTP and Login
exports.verifyOTP = async (req, res) => {
  try {
    // 1. Language bhi body se lein (Frontend se localStorage wali value bhejni hogi)
    const { email, phone, otp, language } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide either an email or a phone number.",
      });
    }

    const query = email ? { email } : { phone };
    let user = await User.findOne(query);

    if (!user || !user.otp) {
      return res.status(404).json({
        success: false,
        message: "OTP not requested or user not found.",
      });
    }

    if (user.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP code." });
    }

    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "This OTP has expired." });
    }

    // Cleanup
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;

    // 2. Profile aur Language logic
    const { isNewUser } = await bootstrapUserResources(
      user,
      language || "English",
    );

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      isNewUser,
      requirePasswordSetup: !user.password, // Frontend can ignore this if you just want to log them in
      userId: user._id,
      token,
      user: buildAuthUserPayload(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set password after OTP verification (Registration Completion)
// @route   POST /api/auth/set-password-after-otp
exports.setPasswordAfterOTP = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Valid userId and password (min 6 chars) required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.isVerified = true;
    user.accountStatus = "active";

    await user.save();

    // Generate JWT only now
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Registration completed successfully.",
      token,
      user: buildAuthUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged-in user (for session check)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-otp -otpExpires -lastOtpSentAt",
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP for Forgot Password (Email or Phone)
// @route   POST /api/auth/forgot-password
exports.forgotPasswordSendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone number is required.",
      });
    }

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with the provided contact.",
      });
    }

    // Rate Limiting Check
    const RESEND_DELAY = 1 * 60 * 1000;
    if (user.lastOtpSentAt) {
      const timePassed = Date.now() - new Date(user.lastOtpSentAt).getTime();
      if (timePassed < RESEND_DELAY) {
        const waitTime = Math.ceil((RESEND_DELAY - timePassed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before requesting a new OTP.`,
        });
      }
    }

    // OTP Generation
    const otp = phone
      ? "123456"
      : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.lastOtpSentAt = new Date();
    await user.save();

    if (email) {
      await transporter.sendMail(buildOtpEmail(email, otp));
    }

    return res.status(200).json({
      success: true,
      message: email
        ? "A verification code has been sent to your email address."
        : "A verification code has been sent to your phone number.",
    });
  } catch (error) {
    console.error("Forgot Password OTP Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during OTP delivery." });
  }
};

// @desc    Reset Password using OTP (Email or Phone)
// @route   POST /api/auth/forgot-password/reset
exports.forgotPasswordReset = async (req, res) => {
  try {
    const { email, phone, otp, newPassword } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide either an email or a phone number.",
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password is required (minimum 6 characters).",
      });
    }

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    if (!user || !user.otp) {
      return res.status(404).json({
        success: false,
        message: "OTP not requested or user not found.",
      });
    }

    if (user.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP code." });
    }

    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "This OTP has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login using Email/Phone and Password
// @route   POST /api/auth/login
exports.loginWithPassword = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide either an email or a phone number.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // P2: Login alert email for new IP
    const currentIP = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || '';
    const isNewDevice = user.lastLoginIP && user.lastLoginIP !== currentIP;

    // Update login history
    user.lastLoginIP = currentIP;
    user.loginHistory = [...(user.loginHistory || []).slice(-9), { ip: currentIP }];
    await user.save();

    if (isNewDevice) {
      try {
        const transporter = require('../utils/emailConfig');
        const FROM = `"RVR Luxury Matrimony" <${process.env.EMAIL_USER}>`;
        await transporter.sendMail({
          from: FROM,
          to: user.email,
          subject: 'New login to your RVR Matrimony account',
          html: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#FBF6ED;border-radius:16px">
            <h2 style="color:#2D2424">New Login Detected</h2>
            <p style="color:#555">A new login to your account was detected from a different IP address.</p>
            <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;padding:16px;margin:20px 0;border:1px solid #F2E9DE">
              <tr><td style="padding:8px;color:#888;font-size:12px">IP Address</td><td style="padding:8px;font-size:13px;color:#2D2424">${currentIP}</td></tr>
              <tr><td style="padding:8px;color:#888;font-size:12px">Time</td><td style="padding:8px;font-size:13px;color:#2D2424">${new Date().toLocaleString('en-IN')}</td></tr>
            </table>
            <p style="color:#C0392B;font-size:13px">If this was not you, please change your password immediately.</p>
          </div>`,
        });
      } catch (emailErr) {
        console.error('Login alert email error:', emailErr.message);
      }
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      token,
      user: buildAuthUserPayload(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start Google OAuth flow
// @route   GET /api/auth/google
exports.startGoogleAuth = async (req, res) => {
  try {
    requireGoogleOAuthConfig();

    const { callbackUrl, redirect } = req.query;

    if (!callbackUrl) {
      return res.status(400).json({
        success: false,
        message: "callbackUrl is required.",
      });
    }

    try {
      validateFrontendCallbackUrl(callbackUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "callbackUrl must be a valid absolute URL.",
      });
    }

    const state = createGoogleState({
      callbackUrl,
      redirect,
    });

    const googleUrl = new URL(GOOGLE_AUTH_URL);
    googleUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
    googleUrl.searchParams.set("redirect_uri", `${req.protocol}://${req.get("host")}${req.baseUrl}/google/callback`);
    googleUrl.searchParams.set("response_type", "code");
    googleUrl.searchParams.set("scope", GOOGLE_SCOPE);
    googleUrl.searchParams.set("state", state);
    googleUrl.searchParams.set("access_type", "offline");
    googleUrl.searchParams.set("prompt", "consent");

    return res.redirect(googleUrl.toString());
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to start Google login.",
    });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
exports.handleGoogleCallback = async (req, res) => {
  let callbackUrl = "";
  let redirect = "";

  try {
    requireGoogleOAuthConfig();

    const { code, state, error } = req.query;

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "Missing OAuth state.",
      });
    }

    const parsedState = parseGoogleState(state);
    callbackUrl = validateFrontendCallbackUrl(parsedState.callbackUrl).toString();
    redirect = parsedState.redirect || "";

    if (error) {
      return res.redirect(
        buildFrontendRedirectUrl({
          callbackUrl,
          redirect,
          error: "Google login was cancelled or denied.",
        }),
      );
    }

    if (!code) {
      return res.redirect(
        buildFrontendRedirectUrl({
          callbackUrl,
          redirect,
          error: "Google login failed",
        }),
      );
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${req.protocol}://${req.get("host")}${req.baseUrl}/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || "Failed to exchange Google OAuth code.");
    }

    const googleProfileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleProfile = await googleProfileResponse.json();
    if (!googleProfileResponse.ok || !googleProfile.sub || !googleProfile.email) {
      throw new Error("Unable to fetch Google profile.");
    }

    let user = await User.findOne({
      $or: [{ googleId: googleProfile.sub }, { email: googleProfile.email.toLowerCase() }],
    });

    if (!user) {
      user = new User({
        email: googleProfile.email.toLowerCase(),
        googleId: googleProfile.sub,
        fullName: googleProfile.name,
        profileImage: googleProfile.picture,
        authProvider: "google",
        isVerified: true,
        accountStatus: "active",
      });
    } else {
      user.googleId = user.googleId || googleProfile.sub;
      user.email = user.email || googleProfile.email.toLowerCase();
      user.fullName = user.fullName || googleProfile.name;
      user.profileImage = user.profileImage || googleProfile.picture;
      user.authProvider = user.authProvider === "local" && !user.password
        ? "google"
        : user.authProvider;
      user.isVerified = true;
      if (user.accountStatus === "pending") {
        user.accountStatus = "active";
      }
    }

    const { isNewUser } = await bootstrapUserResources(user);
    await user.save();

    const token = generateToken(user._id);

    return res.redirect(
      buildFrontendRedirectUrl({
        callbackUrl,
        token,
        user: buildAuthUserPayload(user),
        isNewUser,
        redirect,
      }),
    );
  } catch (error) {
    if (callbackUrl) {
      return res.redirect(
        buildFrontendRedirectUrl({
          callbackUrl,
          redirect,
          error: error.message || "Google login failed",
        }),
      );
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Google login failed",
    });
  }
};

// @desc    Add or Update Password for Logged-in User
// @route   PUT /api/auth/password
// @access  Private
exports.setOrUpdatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password is required (minimum 6 characters).",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const hadPassword = Boolean(user.password);

    // No current password check per requirement

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: hadPassword
        ? "Password updated successfully."
        : "Password set successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check JWT token status (valid/expired)
// @route   GET /api/auth/token-status
// @access  Public (requires token in Authorization header)
exports.checkTokenStatus = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(400).json({
        success: false,
        valid: false,
        expired: false,
        message: "Authorization token is required",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        valid: true,
        expired: false,
        userId: decoded.id,
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null,
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(200).json({
          success: true,
          valid: false,
          expired: true,
          message: "Token expired",
          expiredAt: error.expiredAt || null,
        });
      }

      return res.status(200).json({
        success: true,
        valid: false,
        expired: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
