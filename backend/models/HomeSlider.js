const mongoose = require('mongoose');

const homeSliderSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true
        },
        subtitle: {
            type: String,
            trim: true
        },
        image: {
            type: String,
            required: true,
            trim: true
        },
        buttonLink: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('HomeSlider', homeSliderSchema);

