const { Blog, FAQ, ContentPage } = require('../models/Content');

// ─── BLOG ───

exports.listBlogs = async (req, res) => {
    try {
        const { published, category, page = 1, limit = 10 } = req.query;
        const query = {};
        if (published === 'true') query.isPublished = true;
        if (category) query.category = category;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [blogs, total] = await Promise.all([
            Blog.find(query, '-content').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            Blog.countDocuments(query),
        ]);
        return res.status(200).json({ success: true, data: blogs, total, totalPages: Math.ceil(total / limit) });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.getBlog = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
        blog.viewCount += 1; await blog.save();
        return res.status(200).json({ success: true, data: blog });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.createBlog = async (req, res) => {
    try {
        const { title, content, excerpt, coverImage, category, tags, isPublished } = req.body;
        if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content required' });
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
        const blog = await Blog.create({ title, slug, content, excerpt, coverImage, category, tags, isPublished, publishedAt: isPublished ? new Date() : null });
        return res.status(201).json({ success: true, data: blog, message: 'Blog created' });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.updateBlog = async (req, res) => {
    try {
        const updates = req.body;
        if (updates.isPublished && !updates.publishedAt) updates.publishedAt = new Date();
        const blog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
        return res.status(200).json({ success: true, data: blog, message: 'Updated' });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteBlog = async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Deleted' });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

// ─── FAQ ───

exports.listFAQs = async (req, res) => {
    try {
        const query = req.query.active === 'true' ? { isActive: true } : {};
        const faqs = await FAQ.find(query).sort({ order: 1, createdAt: 1 });
        return res.status(200).json({ success: true, data: faqs });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.createFAQ = async (req, res) => {
    try {
        const faq = await FAQ.create(req.body);
        return res.status(201).json({ success: true, data: faq, message: 'FAQ created' });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!faq) return res.status(404).json({ success: false, message: 'Not found' });
        return res.status(200).json({ success: true, data: faq, message: 'Updated' });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteFAQ = async (req, res) => {
    try {
        await FAQ.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Deleted' });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

// ─── CONTENT PAGES (Terms, Privacy, About, Contact) ───

exports.getContentPage = async (req, res) => {
    try {
        const page = await ContentPage.findOne({ pageKey: req.params.pageKey });
        if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
        return res.status(200).json({ success: true, data: page });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.upsertContentPage = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content required' });
        const page = await ContentPage.findOneAndUpdate(
            { pageKey: req.params.pageKey },
            { title, content, lastUpdatedBy: req.admin?.name || 'Admin' },
            { new: true, upsert: true }
        );
        return res.status(200).json({ success: true, data: page, message: 'Saved' });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
