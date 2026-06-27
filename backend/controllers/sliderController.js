const Slider = require('../models/Slider');

const normalizeSliderPayload = (body = {}) => {
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

// @desc    Create a slider
// @route   POST /api/sliders
// @access  Private (Admin Only)
exports.createSlider = async (req, res) => {
    try {
        const payload = normalizeSliderPayload(req.body);

        if (!payload.image) {
            return res.status(400).json({ success: false, message: 'image is required' });
        }

        const slider = await Slider.create(payload);

        return res.status(201).json({
            success: true,
            message: 'Slider created successfully',
            data: slider
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all sliders
// @route   GET /api/sliders
// @access  Public
exports.getSliders = async (req, res) => {
    try {
        const query = {};

        if (req.query.activeOnly === 'true') {
            query.isActive = true;
        }

        const sliders = await Slider.find(query).sort({ order: 1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: sliders.length,
            data: sliders
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get a single slider by id
// @route   GET /api/sliders/:id
// @access  Public
exports.getSliderById = async (req, res) => {
    try {
        const slider = await Slider.findById(req.params.id);

        if (!slider) {
            return res.status(404).json({ success: false, message: 'Slider not found' });
        }

        return res.status(200).json({
            success: true,
            data: slider
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a slider
// @route   PUT /api/sliders/:id
// @access  Private (Admin Only)
exports.updateSlider = async (req, res) => {
    try {
        const payload = normalizeSliderPayload(req.body);

        if (Object.prototype.hasOwnProperty.call(payload, 'image') && !payload.image) {
            return res.status(400).json({ success: false, message: 'image is required' });
        }

        const slider = await Slider.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true }
        );

        if (!slider) {
            return res.status(404).json({ success: false, message: 'Slider not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Slider updated successfully',
            data: slider
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a slider
// @route   DELETE /api/sliders/:id
// @access  Private (Admin Only)
exports.deleteSlider = async (req, res) => {
    try {
        const slider = await Slider.findByIdAndDelete(req.params.id);

        if (!slider) {
            return res.status(404).json({ success: false, message: 'Slider not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Slider deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
