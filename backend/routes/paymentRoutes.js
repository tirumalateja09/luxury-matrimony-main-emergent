const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, razorpayWebhook } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/webhook', razorpayWebhook);

module.exports = router;