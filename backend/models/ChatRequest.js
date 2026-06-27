const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

// Indexing for faster tab loading
chatRequestSchema.index({ senderId: 1, status: 1 });
chatRequestSchema.index({ receiverId: 1, status: 1 });

module.exports = mongoose.model('ChatRequest', chatRequestSchema);