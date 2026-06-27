const Razorpay = require('razorpay');

// Gracefully handle missing Razorpay keys (payment features will be disabled)
let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET &&
    !process.env.RAZORPAY_KEY_ID.includes('dummy') &&
    !process.env.RAZORPAY_KEY_ID.includes('your_')) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
} else {
    console.warn('Razorpay not configured. Payment features disabled.');
}

module.exports = razorpayInstance;