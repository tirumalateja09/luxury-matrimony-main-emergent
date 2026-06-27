const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referralCode: { type: String, required: true, index: true },
    refereeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    refereeEmail: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'registered', 'rewarded'], default: 'pending' },
    rewardType: { type: String, enum: ['boost', 'coupon', 'none'], default: 'none' },
    rewardGiven: { type: Boolean, default: false },
    rewardGivenAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
