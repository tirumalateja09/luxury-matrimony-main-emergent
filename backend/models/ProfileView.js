const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  viewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  viewedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProfileView', profileViewSchema);