const mongoose = require('mongoose');

const profileBoostSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  transactionId: { 
    type: String, 
    required: true // Razorpay/Payment Gateway ID
  },
  amount: { 
    type: Number, 
    required: true 
  },
  planType: { 
    type: String, 
    enum: ['24 Hours', '3 Days', '7 Days'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Success', 'Failed', 'Pending'], 
    default: 'Pending' 
  },
  activatedAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    required: true // Calculation: activatedAt + planType duration
  }
}, { timestamps: true });

module.exports = mongoose.model('ProfileBoost', profileBoostSchema);