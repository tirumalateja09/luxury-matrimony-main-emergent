const HomeSlider = require('../models/HomeSlider');

const normalizeHomeSliderPayload = (body = {}) => {
    const payload = {
        title: typeof body.title === 'string' ? body.title.trim() : body.title,
        subtitle: typeof body.subtitle === 'string' ? body.subtitle.trim() : body.subtitle,
        image: typeof body.image === 'string' ? body.image.trim() : body.image,
        buttonLink: typeof body.buttonLink === 'string' ? body.buttonLink.trim() : body.buttonLink,
        isActive: body.isActive,
        order: body.order
    };

    return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
    );
};

// @desc    Create a home slider
// @route   POST /api/home-sliders
// @access  Private (Admin Only)
exports.createHomeSlider = async (req, res) => {
    try {
        const payload = normalizeHomeSliderPayload(req.body);

        if (!payload.image) {
            return res.status(400).json({ success: false, message: 'image is required' });
        }

        const homeSlider = await HomeSlider.create(payload);

        return res.status(201).json({
            success: true,
            message: 'Home slider created successfully',
            data: homeSlider
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all home sliders
// @route   GET /api/home-sliders
// @access  Public
exports.getHomeSliders = async (req, res) => {
    try {
        const query = {};

        if (req.query.activeOnly === 'true') {
            query.isActive = true;
        }

        const homeSliders = await HomeSlider.find(query).sort({ order: 1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: homeSliders.length,
            data: homeSliders
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get a single home slider by id
// @route   GET /api/home-sliders/:id
// @access  Public
exports.getHomeSliderById = async (req, res) => {
    try {
        const homeSlider = await HomeSlider.findById(req.params.id);

        if (!homeSlider) {
            return res.status(404).json({ success: false, message: 'Home slider not found' });
        }

        return res.status(200).json({
            success: true,
            data: homeSlider
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a home slider
// @route   PUT /api/home-sliders/:id
// @access  Private (Admin Only)
exports.updateHomeSlider = async (req, res) => {
    try {
        const payload = normalizeHomeSliderPayload(req.body);

        if (Object.prototype.hasOwnProperty.call(payload, 'image') && !payload.image) {
            return res.status(400).json({ success: false, message: 'image is required' });
        }

        const homeSlider = await HomeSlider.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        );

        if (!homeSlider) {
            return res.status(404).json({ success: false, message: 'Home slider not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Home slider updated successfully',
            data: homeSlider
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a home slider
// @route   DELETE /api/home-sliders/:id
// @access  Private (Admin Only)
exports.deleteHomeSlider = async (req, res) => {
    try {
        const homeSlider = await HomeSlider.findByIdAndDelete(req.params.id);

        if (!homeSlider) {
            return res.status(404).json({ success: false, message: 'Home slider not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Home slider deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

