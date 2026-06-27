const WeddingService = require('../models/WeddingService');

// @desc  Public listing (no auth required)
// @route GET /api/wedding-services
exports.listServices = async (req, res) => {
    try {
        const { category, city, state, search, featured, page = 1, limit = 12 } = req.query;
        const query = { isActive: true };
        if (category) query.category = category;
        if (city) query.city = new RegExp(city, 'i');
        if (state) query.state = new RegExp(state, 'i');
        if (featured === 'true') query.isFeatured = true;
        if (search) query.$or = [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [services, total] = await Promise.all([
            WeddingService.find(query, '-contactInquiries').sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            WeddingService.countDocuments(query),
        ]);
        return res.status(200).json({ success: true, data: services, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

// @desc  Get single service
// @route GET /api/wedding-services/:id
exports.getService = async (req, res) => {
    try {
        const service = await WeddingService.findById(req.params.id, '-contactInquiries');
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        return res.status(200).json({ success: true, data: service });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

// @desc  Contact a vendor (saves inquiry)
// @route POST /api/wedding-services/:id/contact
exports.contactVendor = async (req, res) => {
    try {
        const { name, phone, email, message, selectedService } = req.body;
        const service = await WeddingService.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        service.contactInquiries.push({
            userId: req.user?.id || null,
            name, phone, email, message, selectedService,
        });
        await service.save();

        return res.status(201).json({ success: true, message: 'Your inquiry has been sent to the vendor.' });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

// @desc  Get categories list
// @route GET /api/wedding-services/categories
exports.getCategories = async (req, res) => {
    const categories = WeddingService.schema.path('category').enumValues;
    return res.status(200).json({ success: true, data: categories });
};

// ───── ADMIN CRUD ─────

exports.adminListServices = async (req, res) => {
    try {
        const { page = 1, limit = 20, category } = req.query;
        const query = category ? { category } : {};
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [services, total] = await Promise.all([
            WeddingService.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            WeddingService.countDocuments(query),
        ]);
        return res.status(200).json({ success: true, data: services, total, totalPages: Math.ceil(total / limit) });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

exports.adminCreateService = async (req, res) => {
    try {
        const service = await WeddingService.create(req.body);
        return res.status(201).json({ success: true, data: service, message: 'Service created' });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

exports.adminUpdateService = async (req, res) => {
    try {
        const service = await WeddingService.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).json({ success: false, message: 'Not found' });
        return res.status(200).json({ success: true, data: service, message: 'Updated' });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

exports.adminDeleteService = async (req, res) => {
    try {
        await WeddingService.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Service deleted' });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

exports.adminGetInquiries = async (req, res) => {
    try {
        const service = await WeddingService.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Not found' });
        return res.status(200).json({ success: true, data: service.contactInquiries });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};
