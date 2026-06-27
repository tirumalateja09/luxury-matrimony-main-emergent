const mongoose = require('mongoose');

const WEDDING_CATEGORIES = ['Photographer', 'Caterer', 'Decorator', 'Mehendi', 'Makeup Artist', 'Wedding Venue'];

const weddingServiceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: WEDDING_CATEGORIES },
    description: { type: String, default: '' },
    location: { type: String, required: true, trim: true },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    photos: [{ type: String }],
    priceRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    contactInquiries: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
            phone: String,
            email: String,
            message: String,
            selectedService: String,
            contactedAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });

weddingServiceSchema.statics.CATEGORIES = WEDDING_CATEGORIES;
module.exports = mongoose.model('WeddingService', weddingServiceSchema);
