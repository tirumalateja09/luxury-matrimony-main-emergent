const mongoose = require('mongoose');

const viewLogSchema = new mongoose.Schema({
  viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  viewedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  viewedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ViewLog', viewLogSchema);