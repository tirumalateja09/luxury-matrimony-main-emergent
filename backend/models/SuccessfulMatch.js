const mongoose = require('mongoose');

const successfulMatchSchema = new mongoose.Schema(
  {
    brideProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    groomProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    brideName: { type: String, default: 'Unknown' },
    groomName: { type: String, default: 'Unknown' },
    bridePhoto: { type: String, default: '' },
    groomPhoto: { type: String, default: '' },
    matchDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'confirmed',
    },
    notes: { type: String, default: '' },
    createdBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SuccessfulMatch', successfulMatchSchema);
