const mongoose = require('mongoose');

const homeSliderSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true },
        subtitle: { type: String, trim: true },
        image: { type: String, default: '', trim: true },
        videoUrl: { type: String, default: '', trim: true },
        mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
        buttonLink: { type: String, trim: true },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.model('HomeSlider', homeSliderSchema);

