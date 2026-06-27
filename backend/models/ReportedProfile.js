const mongoose = require('mongoose');

const reportedProfileSchema = new mongoose.Schema(
  {
    reportedProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    reportedName: { type: String, default: 'Unknown' },
    reportedPhoto: { type: String, default: '' },
    reportedBy: { type: String, default: '' },
    reason: { type: String, required: true },
    description: { type: String, default: '' },
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
