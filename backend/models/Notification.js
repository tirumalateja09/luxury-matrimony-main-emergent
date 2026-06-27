const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  },
  type: { 
    type: String, 
    enum: ['interest_received', 'interest_accepted', 'new_message', 'profile_view', 'verification_reminder', 'subscription_expiry', 'shortlist_received', 'system', 'approval_request'] 
  },
  title: String,
  description: String,
  message: String,
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.pre('validate', function syncDescriptionAndMessage(next) {
  if (!this.description && this.message) {
    this.description = this.message;
  }

  if (!this.message && this.description) {
    this.message = this.description;
  }

  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
