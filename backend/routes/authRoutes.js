const rateLimit = require('express-rate-limit');
const express = require('express');
const router = express.Router();
const { sendOTP, sendLoginOTP, verifyOTP, getMe, checkTokenStatus, forgotPasswordSendOTP, forgotPasswordReset, loginWithPassword, setOrUpdatePassword , setPasswordAfterOTP, startGoogleAuth, handleGoogleCallback, sendPhoneUpdateOTP, verifyPhoneUpdateOTP, sendEmailUpdateOTP, verifyEmailUpdateOTP } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 5, // Limit each IP to 5 OTP requests per window
    message: {
        success: false,
        message: "Too many OTP requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// otpLimiter
router.post('/send-otp', sendOTP);
router.post('/login/send-otp', sendLoginOTP);
router.post('/verify-otp', verifyOTP);
router.post('/set-password-after-otp', setPasswordAfterOTP);
router.post('/login', loginWithPassword);
router.post('/forgot-password', forgotPasswordSendOTP);
router.post('/forgot-password/reset', forgotPasswordReset);
router.post('/email/send-otp', protect, sendEmailUpdateOTP);
router.post('/email/verify-otp', protect, verifyEmailUpdateOTP);
router.post('/phone/send-otp', protect, sendPhoneUpdateOTP);
router.post('/phone/verify-otp', protect, verifyPhoneUpdateOTP);
router.put('/password', protect, setOrUpdatePassword);
router.get('/me', protect, getMe);
router.get('/token-status', checkTokenStatus);
router.get('/google', startGoogleAuth);
router.get('/google/callback', handleGoogleCallback);

module.exports = router;
