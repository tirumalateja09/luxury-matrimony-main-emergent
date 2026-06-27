const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  sharedNumber: { type: String, default: null },
  requestedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ContactRequest', contactRequestSchema);