const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  targetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true }); // updatedAt automatically handled by timestamps

module.exports = mongoose.model('Shortlist', shortlistSchema);