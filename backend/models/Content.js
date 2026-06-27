const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    category: { type: String, default: 'General' },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    author: { type: String, default: 'RVR Matrimony' },
    viewCount: { type: Number, default: 0 },
}, { timestamps: true });

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'General' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const contentPageSchema = new mongoose.Schema({
    pageKey: { type: String, required: true, unique: true, enum: ['terms', 'privacy', 'about', 'contact'] },
    title: { type: String, required: true },
    content: { type: String, required: true },
    lastUpdatedBy: { type: String, default: 'Admin' },
}, { timestamps: true });

module.exports = {
    Blog: mongoose.model('Blog', blogSchema),
    FAQ: mongoose.model('FAQ', faqSchema),
    ContentPage: mongoose.model('ContentPage', contentPageSchema),
};
