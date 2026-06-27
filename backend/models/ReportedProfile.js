const mongoose = require('mongoose');

const reportedProfileSchema = new mongoose.Schema(
  {
    reportedProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    reportedName: { type: String, default: 'Unknown' },
    reportedPhoto: { type: String, default: '' },
    reportedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reportedBy: { type: String, default: '' },
    reason: { type: String, required: true },
    description: { type: String, default: '' },
    source: { type: String, enum: ['admin', 'chat', 'profile'], default: 'admin' },
    evidenceMessages: [
      {
        senderId: mongoose.Schema.Types.ObjectId,
        content: String,
        sentAt: Date,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReportedProfile', reportedProfileSchema);
