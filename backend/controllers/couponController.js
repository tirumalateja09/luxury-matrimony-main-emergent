const Coupon = require('../models/Coupon');

// @desc  Validate coupon + compute discount
// @route POST /api/coupons/validate
exports.validateCoupon = async (req, res) => {
    try {
        const { code, planKey, amount } = req.body;
        const userId = req.user.id;
        if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }
        if (coupon.usedBy.some((id) => id.toString() === userId.toString())) {
            return res.status(400).json({ success: false, message: 'You have already used this coupon' });
        }
        if (coupon.applicablePlans.length > 0 && planKey && !coupon.applicablePlans.includes(planKey)) {
            return res.status(400).json({ success: false, message: `Coupon is not valid for ${planKey} plan` });
        }
        if (amount < coupon.minOrderAmount) {
            return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
        }

        let discountAmount = coupon.discountType === 'flat'
            ? coupon.discountValue
            : Math.round((amount * coupon.discountValue) / 100);

        if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        const finalAmount = Math.max(0, amount - discountAmount);

        return res.status(200).json({
            success: true,
            couponId: coupon._id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
            originalAmount: amount,
            finalAmount,
            message: `Coupon applied! You save ₹${discountAmount}`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc  Mark coupon as used (called after payment success)
// @route POST /api/coupons/redeem
exports.redeemCoupon = async (req, res) => {
    try {
        const { couponId } = req.body;
        const userId = req.user.id;
        const coupon = await Coupon.findById(couponId);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

        coupon.usedCount += 1;
        if (!coupon.usedBy.includes(userId)) coupon.usedBy.push(userId);
        await coupon.save();

        return res.status(200).json({ success: true, message: 'Coupon redeemed' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ───── ADMIN CRUD ─────

exports.listCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: coupons });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create({ ...req.body, createdBy: req.admin._id });
        return res.status(201).json({ success: true, data: coupon, message: 'Coupon created' });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        return res.status(200).json({ success: true, data: coupon, message: 'Coupon updated' });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: 'Coupon deleted' });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};
