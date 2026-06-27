const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planName: { type: String, enum: ['Free', 'Gold', 'Premium'] },
    amount: Number,
   transactionId: { type: String },
    billingCycle: { type: String, enum: ['QUARTERLY', 'HALF_YEARLY', 'LIFETIME'] },

    features: {
        browseProfiles: { type: Boolean, default: true }, // for all
        shortlistProfiles: { type: Boolean, default: true }, // for all
        sendInterests: { type: String, enum: ['LIMITED', 'UNLIMITED'], default: 'LIMITED' },
        viewUnblurredPhotos: { type: Boolean, default: false }, // Gold/Premium
        fullPhotoGallery: { type: Boolean, default: false }, // Only Premium
        chatMessaging: { type: String, enum: ['NONE', 'LIMITED', 'UNLIMITED'], default: 'NONE' },
        voiceVideoCalls: { type: Boolean, default: false }, // Only Premium
        advancedSearch: { type: Boolean, default: false }, // Gold/Premium
        viewContactDetails: { type: Boolean, default: false }, // Gold/Premium
        horoscopeMatching: { type: Boolean, default: false }, // Only Premium
        gothramDosha: { type: Boolean, default: false }, // Only Premium
        whoViewedYou: { type: Boolean, default: false }, // Gold/Premium
        profileBoost: { type: Boolean, default: false }, // Only Premium
        premiumEvents: { type: Boolean, default: false } // Only Premium
    },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // Lifetime ke liye null 
    paymentStatus: { type: String, enum: ['completed', 'pending', 'failed'] }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);