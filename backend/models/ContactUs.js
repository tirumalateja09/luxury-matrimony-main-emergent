const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true, trim: true },
        emailAddress: { type: String, required: true, trim: true, lowercase: true },
        queryType: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true }
    },
    { timestamps: true }
);

contactUsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactUs', contactUsSchema);
