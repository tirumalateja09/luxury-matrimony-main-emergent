const Profile = require('../models/Profile');
const Referral = require('../models/Referral');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const crypto = require('crypto');

// Generate unique referral code for a user
const generateCode = (userId) =>
    'RVR' + userId.toString().slice(-4).toUpperCase() + crypto.randomBytes(3).toString('hex').toUpperCase();

// @desc  Get current user's referral code (auto-create if not exists)
// @route GET /api/referrals/my-code
exports.getMyReferralCode = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) return res.status(404).json({ success: false, message: 'Complete your profile first' });

        if (!profile.referralCode) {
            profile.referralCode = generateCode(req.user.id);
            await profile.save();
        }

        const referrals = await Referral.find({ referrerId: req.user.id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            referralCode: profile.referralCode,
            totalReferrals: referrals.length,
            rewarded: referrals.filter((r) => r.rewardGiven).length,
            pending: referrals.filter((r) => !r.rewardGiven).length,
            referrals,
        });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

// @desc  Validate referral code at registration (called during signup)
// @route POST /api/referrals/validate
exports.validateReferralCode = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'Code required' });

        const referrerProfile = await Profile.findOne({ referralCode: code.toUpperCase() });
        if (!referrerProfile) return res.status(404).json({ success: false, message: 'Invalid referral code' });

        return res.status(200).json({
            success: true,
            referrerName: referrerProfile.fullName,
            message: `Valid code — referred by ${referrerProfile.fullName}`,
        });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

// @desc  Apply referral code after registration is complete
// @route POST /api/referrals/apply
exports.applyReferralCode = async (req, res) => {
    try {
        const { code } = req.body;
        const refereeUserId = req.user.id;
        const refereeUser = await User.findById(refereeUserId).select('email');

        if (!code) return res.status(400).json({ success: false, message: 'Code required' });

        const referrerProfile = await Profile.findOne({ referralCode: code.toUpperCase() });
        if (!referrerProfile) return res.status(404).json({ success: false, message: 'Invalid referral code' });

        // Prevent self-referral
        if (referrerProfile.userId.toString() === refereeUserId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot refer yourself' });
        }

        // Check if already used
        const already = await Referral.findOne({ refereeId: refereeUserId });
        if (already) return res.status(400).json({ success: false, message: 'Referral code already applied to your account' });

        // Save referral record
        const referral = await Referral.create({
            referrerId: referrerProfile.userId,
            referralCode: code.toUpperCase(),
            refereeId: refereeUserId,
            refereeEmail: refereeUser?.email || '',
            status: 'registered',
        });

        // Give referee a discount coupon (10% off first plan)
        let refereeCouponCode = null;
        try {
            const couponCode = 'REF' + Math.random().toString(36).substring(2, 7).toUpperCase();
            await Coupon.create({
                code: couponCode,
                discountType: 'percentage',
                discountValue: 10,
                maxUses: 1,
                usedBy: [],
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                isActive: true,
                applicablePlans: [],
                description: `10% off — Referral reward for ${referrerProfile.fullName}'s invite`,
            });
            refereeCouponCode = couponCode;
        } catch (_) {}

        return res.status(200).json({
            success: true,
            message: 'Referral code applied! You get 10% off your first plan.',
            couponCode: refereeCouponCode,
            referrerId: referrerProfile.userId,
        });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

// @desc  Mark referral as rewarded (called after referee makes first payment)
exports.markReferralRewarded = async (refereeUserId) => {
    try {
        const referral = await Referral.findOne({ refereeId: refereeUserId, rewardGiven: false });
        if (!referral) return;

        referral.status = 'rewarded';
        referral.rewardGiven = true;
        referral.rewardGivenAt = new Date();
        referral.rewardType = 'coupon';
        await referral.save();

        // Give referrer a free boost coupon
        const boostCode = 'BOOST' + Math.random().toString(36).substring(2, 7).toUpperCase();
        await Coupon.create({
            code: boostCode,
            discountType: 'flat',
            discountValue: 199,
            maxUses: 1,
            usedBy: [],
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            applicablePlans: [],
            description: `Boost reward — your referral ${referral.refereeEmail} made their first purchase!`,
        });

        console.log(`Referral rewarded for user ${referral.referrerId}, boost code: ${boostCode}`);
    } catch (e) {
        console.error('Referral reward error:', e.message);
    }
};

// ─── ADMIN ───

exports.adminListReferrals = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = status ? { status } : {};
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [referrals, total] = await Promise.all([
            Referral.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
                .populate('referrerId', 'email')
                .populate('refereeId', 'email'),
            Referral.countDocuments(query),
        ]);
        const stats = {
            total: await Referral.countDocuments(),
            rewarded: await Referral.countDocuments({ rewardGiven: true }),
            pending: await Referral.countDocuments({ rewardGiven: false }),
        };
        return res.status(200).json({ success: true, data: referrals, total, stats, totalPages: Math.ceil(total / limit) });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
