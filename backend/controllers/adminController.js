const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const ProfileBoost = require('../models/ProfileBoost');
const SuccessfulMatch = require('../models/SuccessfulMatch');
const ReportedProfile = require('../models/ReportedProfile');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const transporter = require('../utils/emailConfig');

const SITE_URL = (process.env.FRONTEND_URLS || 'http://localhost:3001').split(',')[0].trim();
const FROM = `"RVR Luxury Matrimony" <${process.env.EMAIL_USER}>`;

const buildKycEmail = (name, status, remarks) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FBF6ED;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <tr><td style="background:${status === 'approved' ? 'linear-gradient(135deg,#1a5c2a,#27ae60)' : 'linear-gradient(135deg,#6E2F2F,#c0392b)'};padding:28px 32px;text-align:center">
    <p style="margin:0;color:#fff;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.8">RVR Luxury Matrimony</p>
    <h1 style="margin:8px 0 0;color:#fff;font-size:22px">Profile ${status === 'approved' ? 'Approved' : 'Rejected'}</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#555;margin:0 0 16px">Dear <strong>${name || 'Member'}</strong>,</p>
    ${status === 'approved'
        ? `<p style="color:#555;margin:0 0 24px">Congratulations! Your profile has been <strong style="color:#27ae60">verified and approved</strong>. Your profile is now live and visible to potential matches.</p>
           <div style="text-align:center"><a href="${SITE_URL}/home" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E3B450,#CAA043);color:#2D2424;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px">View My Profile</a></div>`
        : `<p style="color:#555;margin:0 0 16px">Your profile verification was <strong style="color:#c0392b">not approved</strong> for the following reason:</p>
           <div style="background:#FFF5F5;border-left:4px solid #c0392b;border-radius:8px;padding:16px;margin-bottom:24px"><p style="margin:0;color:#c0392b;font-size:14px">${remarks || 'Documents unclear or incomplete.'}</p></div>
           <p style="color:#555;margin:0 0 24px">Please update your documents and resubmit for verification.</p>
           <div style="text-align:center"><a href="${SITE_URL}/profile/verification" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E3B450,#CAA043);color:#2D2424;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px">Resubmit Documents</a></div>`}
  </td></tr>
  <tr><td style="background:#FBF6ED;padding:20px;text-align:center;border-top:1px solid #F2E9DE">
    <p style="margin:0;color:#aaa;font-size:11px">RVR Luxury Matrimony · Verification Team</p>
  </td></tr>
</table></td></tr></table></body></html>`;

const allowedProfileFieldsForAdminCreate = [
    'fullName', 'dob', 'height', 'gender', 'physicalStatus', 'numberOfChildren',
    'childrenLivingTogether', 'maritalStatus', 'diet', 'profileCreatedFor',
    'profileCreatedBy', 'language', 'motherTongue', 'religion', 'community',
    'subCommunity', 'bio', 'aboutFamily', 'fathersOccupation', 'mothersOccupation',
    'brothers', 'sisters', 'marriedSiblings', 'familyIncomeRange', 'familyStatus',
    'familyType', 'drinkingHabits', 'smokingHabits', 'openToPets', 'ownHouse',
    'ownCar', 'hobbies', 'interests', 'country', 'state', 'city', 'citizenship',
    'residentStatus', 'highestEducation', 'degree', 'profession', 'aboutCareer',
    'describeMe', 'annualIncome', 'companyName', 'rashi', 'nakshatra', 'gothram',
    'birthTime', 'birthPlace', 'manglik', 'idProofUrl', 'verificationSelfieUrl',
    'adminRemarks', 'profilePhotos'
];

const pickAllowedFields = (payload, allowedFields) => {
    const filtered = {};
    allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(payload, field) && payload[field] !== undefined) {
            filtered[field] = payload[field];
        }
    });
    return filtered;
};

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const normalizePhone = (value) => (value === null || value === undefined ? '' : String(value).trim());
const allowedAccountStatuses = ['pending', 'active', 'suspended', 'deleted'];

const normalizePossibleDate = (value) => {
    if (value === null || value === undefined || value === '') return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (!parsed) return value;
        return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    }
    const asDate = new Date(value);
    return Number.isNaN(asDate.getTime()) ? value : asDate;
};

const normalizeProfilePhotos = (value) => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
        return value.map((item) => {
            if (typeof item === 'string') {
                const url = item.trim();
                return url ? { url, isMain: false } : null;
            }
            if (item && typeof item === 'object' && item.url) {
                return { url: String(item.url).trim(), isMain: Boolean(item.isMain) };
            }
            return null;
        }).filter(Boolean);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                return normalizeProfilePhotos(parsed);
            } catch (error) {
                return undefined;
            }
        }
        const urls = trimmed.split(',').map((x) => x.trim()).filter(Boolean);
        return urls.map((url, idx) => ({ url, isMain: idx === 0 }));
    }
    return undefined;
};

const createUserAndProfileByAdmin = async (payload = {}) => {
    const email = normalizeEmail(payload.email);
    const phone = normalizePhone(payload.phone);
    if (!email && !phone) throw new Error('Either email or phone is required.');
    if (email) {
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) throw new Error(`User already exists with email: ${email}`);
    }
    if (phone) {
        const existingPhoneUser = await User.findOne({ phone });
        if (existingPhoneUser) throw new Error(`User already exists with phone: ${phone}`);
    }
    const profileSource = payload.profile && typeof payload.profile === 'object' ? payload.profile : payload;
    const profileInput = pickAllowedFields(profileSource, allowedProfileFieldsForAdminCreate);
    if (profileInput.dob !== undefined) profileInput.dob = normalizePossibleDate(profileInput.dob);
    if (profileInput.profilePhotos !== undefined) profileInput.profilePhotos = normalizeProfilePhotos(profileInput.profilePhotos);
    if (profileInput.profileCreatedBy !== undefined) {
        profileInput.profileCreatedFor = profileInput.profileCreatedBy;
        delete profileInput.profileCreatedBy;
    }
    const user = await User.create({
        email: email || undefined,
        phone: phone || undefined,
        accountStatus: payload.accountStatus || 'active',
        isVerified: true
    });
    try {
        const profile = await Profile.create({ userId: user._id, ...profileInput, adminStatus: 'approved' });
        return { user, profile };
    } catch (error) {
        await User.findByIdAndDelete(user._id);
        throw error;
    }
};

// ===================== VERIFY PROFILE =====================
// Helper: create audit log entry
const createAuditLog = async ({ req, action, targetType, targetId, targetName, changedFields, previousValues, newValues, notes }) => {
    try {
        await AuditLog.create({
            adminId: req.user._id,
            adminEmail: req.user.email || '',
            adminRole: req.user.role || '',
            action,
            targetType: targetType || '',
            targetId: String(targetId || ''),
            targetName: targetName || '',
            changedFields: changedFields || {},
            previousValues: previousValues || {},
            newValues: newValues || {},
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
            notes: notes || '',
        });
    } catch (e) {
        console.error('Audit log error:', e.message);
    }
};
exports.verifyUserProfile = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { status, remarks } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        const profile = await Profile.findByIdAndUpdate(
            profileId,
            { adminStatus: status, adminRemarks: status === 'rejected' ? remarks : '' },
            { new: true }
        );
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
        await Notification.create({
            recipientId: profile.userId,
            type: 'verification_reminder',
            title: status === 'approved' ? 'Profile Approved! 🎉' : 'Profile Rejected ❌',
            message: status === 'approved'
                ? 'Congratulations! Your profile is now live.'
                : `Your profile was rejected. Reason: ${remarks}`
        });

        // Send KYC status email
        try {
            const user = await User.findById(profile.userId).select('email');
            if (user?.email) {
                await transporter.sendMail({
                    from: FROM,
                    to: user.email,
                    subject: status === 'approved'
                        ? 'Your RVR Matrimony profile has been approved!'
                        : 'Action required: Your RVR Matrimony profile verification',
                    html: buildKycEmail(profile.fullName, status, remarks),
                });
            }
        } catch (emailErr) {
            console.error('KYC email error:', emailErr.message);
        }

        // Audit log
        await createAuditLog({
            req,
            action: 'verify_profile',
            targetType: 'Profile',
            targetId: profileId,
            targetName: profile.fullName || '',
            changedFields: { adminStatus: true, adminRemarks: true },
            previousValues: { adminStatus: profile.adminStatus },
            newValues: { adminStatus: status, adminRemarks: remarks || '' },
            notes: `Profile ${status} by admin`
        });

        res.status(200).json({ success: true, message: `Profile has been ${status} successfully`, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== GET ALL USERS =====================
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let query = { isVerified: true };
        const profileFilters = {};

        // Existing filters
        if (req.query.status) query.accountStatus = req.query.status;
        if (req.query.approveStatus) profileFilters.adminStatus = req.query.approveStatus;
        if (req.query.membershipType || req.query.membership) {
            profileFilters.membershipType = req.query.membershipType || req.query.membership;
        }
        if (req.query.gender) profileFilters.gender = req.query.gender;

        // P1: New profile-level filters
        if (req.query.religion) profileFilters.religion = new RegExp(`^${req.query.religion}$`, 'i');
        if (req.query.community) profileFilters.community = new RegExp(`^${req.query.community}$`, 'i');
        if (req.query.state) profileFilters.state = new RegExp(`^${req.query.state}$`, 'i');
        if (req.query.city) profileFilters.city = new RegExp(`^${req.query.city}$`, 'i');
        if (req.query.education) profileFilters.highestEducation = new RegExp(`^${req.query.education}$`, 'i');

        // P1: Age range filter (converts to dob range)
        if (req.query.minAge || req.query.maxAge) {
            const today = new Date();
            const minAge = parseInt(req.query.minAge) || 18;
            const maxAge = parseInt(req.query.maxAge) || 80;
            profileFilters.dob = {
                $gte: new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate()),
                $lte: new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()),
            };
        }

        if (Object.keys(profileFilters).length > 0) {
            const filteredProfiles = await Profile.find(profileFilters).select('userId');
            const filteredUserIds = filteredProfiles.map((p) => p.userId);
            if (filteredUserIds.length === 0) {
                return res.status(200).json({ success: true, count: 0, totalUsers: 0, totalPages: 0, currentPage: page, data: [] });
            }
            query._id = { $in: filteredUserIds };
        }
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            const profileSearchQuery = { fullName: searchRegex };
            if (query._id) profileSearchQuery.userId = query._id;
            const matchedProfiles = await Profile.find(profileSearchQuery).select('userId');
            const matchedUserIdsByName = matchedProfiles.map((p) => p.userId);
            const orConditions = [{ email: searchRegex }, { phone: searchRegex }];
            if (matchedUserIdsByName.length > 0) orConditions.push({ _id: { $in: matchedUserIdsByName } });
            query.$or = orConditions;
        }
        const users = await User.find(query).select('-otp -otpExpires -lastOtpSentAt').sort({ createdAt: -1 }).skip(skip).limit(limit);
        const usersWithProfiles = await Promise.all(users.map(async (user) => {
            const profile = await Profile.findOne({ userId: user._id });
            return { account: user, profile: profile || 'No profile created yet' };
        }));
        const total = await User.countDocuments(query);
        res.status(200).json({
            success: true,
            count: usersWithProfiles.length,
            totalUsers: total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            currentPage: page,
            data: usersWithProfiles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== USER DETAILS =====================
exports.getUserDetailsById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-otp -otpExpires -lastOtpSentAt');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const profile = await Profile.findOne({ userId: req.params.id });
        const subscriptions = await Subscription.find({ userId: req.params.id }).sort({ createdAt: -1 });
        const boosts = await ProfileBoost.find({ userId: req.params.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: { account: user, profile: profile || 'Profile not created yet', subscriptions, boosts } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserDetailsByProfileId = async (req, res) => {
    try {
        const { profileId } = req.params;
        const profile = await Profile.findById(profileId);
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
        const user = await User.findById(profile.userId).select('-otp -otpExpires -lastOtpSentAt');
        if (!user) return res.status(404).json({ success: false, message: 'User not found for this profile' });
        const subscriptions = await Subscription.find({ userId: profile.userId }).sort({ createdAt: -1 });
        const boosts = await ProfileBoost.find({ userId: profile.userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: { account: user, profile, subscriptions, boosts } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== MANUAL USER CREATE =====================
exports.createUserManually = async (req, res) => {
    try {
        const created = await createUserAndProfileByAdmin(req.body);
        return res.status(201).json({ success: true, message: 'User and profile created successfully by admin', data: created });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// ===================== BULK CREATE FROM EXCEL =====================
exports.bulkCreateUsersFromExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Excel file is required. Use form-data key: file' });
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) return res.status(400).json({ success: false, message: 'Excel sheet is empty' });
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (!rows.length) return res.status(400).json({ success: false, message: 'No data rows found in Excel file' });
        const created = [];
        const failed = [];
        for (let i = 0; i < rows.length; i++) {
            try {
                const result = await createUserAndProfileByAdmin(rows[i]);
                created.push({ row: i + 2, userId: result.user._id });
            } catch (error) {
                failed.push({ row: i + 2, error: error.message });
            }
        }
        return res.status(201).json({
            success: true,
            message: 'Bulk upload processed',
            summary: { totalRows: rows.length, createdCount: created.length, failedCount: failed.length },
            created,
            failed
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ENHANCED ADMIN STATS =====================
exports.getAdminStats = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [totalUsers, todaysRegistrations, totalMatches, pendingVerification, reportedProfiles] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: todayStart } }),
            SuccessfulMatch.countDocuments(),
            Profile.countDocuments({ adminStatus: 'pending' }),
            ReportedProfile.countDocuments({ status: { $ne: 'resolved' } }),
        ]);

        // Active users (active account + approved profile)
        const activeResult = await User.aggregate([
            { $match: { accountStatus: 'active' } },
            { $lookup: { from: 'profiles', localField: '_id', foreignField: 'userId', as: 'profile' } },
            { $match: { 'profile.adminStatus': 'approved' } },
            { $count: 'total' }
        ]);
        const activeUsers = activeResult[0]?.total || 0;

        // Membership breakdown
        const membershipResult = await Profile.aggregate([
            { $group: { _id: '$membershipType', count: { $sum: 1 } } }
        ]);
        const membershipCounts = {};
        membershipResult.forEach((item) => { if (item._id) membershipCounts[item._id] = item.count; });

        // Boost counts by planType
        const boostResult = await ProfileBoost.aggregate([
            { $match: { status: 'Success' } },
            { $group: { _id: '$planType', count: { $sum: 1 } } }
        ]);
        const boostCounts = {};
        boostResult.forEach((item) => { if (item._id) boostCounts[item._id] = item.count; });

        // Gender ratio
        const genderResult = await Profile.aggregate([
            { $match: { gender: { $in: ['Male', 'Female'] } } },
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);
        const genderCounts = {};
        genderResult.forEach((item) => { if (item._id) genderCounts[item._id] = item.count; });

        // Paid users
        const [paidSubIds, paidBoostIds] = await Promise.all([
            Subscription.distinct('userId', { planName: { $in: ['Gold', 'Premium'] }, paymentStatus: 'completed' }),
            ProfileBoost.distinct('userId', { status: 'Success' })
        ]);
        const paidUsers = new Set([
            ...paidSubIds.map((id) => id.toString()),
            ...paidBoostIds.map((id) => id.toString())
        ]).size;

        // Revenue by plan
        const subRevResult = await Subscription.aggregate([
            { $match: { paymentStatus: 'completed', planName: { $in: ['Gold', 'Premium'] } } },
            { $group: { _id: '$planName', total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const revByPlan = {};
        subRevResult.forEach((item) => { revByPlan[item._id] = { revenue: item.total, count: item.count }; });

        // Revenue by boost
        const boostRevResult = await ProfileBoost.aggregate([
            { $match: { status: 'Success' } },
            { $group: { _id: '$planType', total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const revByBoost = {};
        boostRevResult.forEach((item) => { revByBoost[item._id] = { revenue: item.total, count: item.count }; });

        const totalSubRevenue = subRevResult.reduce((sum, i) => sum + i.total, 0);
        const totalBoostRevenue = boostRevResult.reduce((sum, i) => sum + i.total, 0);

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                paidUsers,
                todaysRegistrations,
                totalRevenue: totalSubRevenue + totalBoostRevenue,
                successfulMatches: totalMatches,
                pendingVerification,
                reportedProfiles,
                premiumMembers: {
                    Gold: membershipCounts.Gold || 0,
                    Premium: membershipCounts.Premium || 0,
                    Free: membershipCounts.Free || 0,
                },
                boostCounts: {
                    '24 Hours': boostCounts['24 Hours'] || 0,
                    '3 Days': boostCounts['3 Days'] || 0,
                    '7 Days': boostCounts['7 Days'] || 0,
                },
                genderRatio: {
                    Male: genderCounts.Male || 0,
                    Female: genderCounts.Female || 0,
                },
                revenueBreakdown: {
                    subscriptions: totalSubRevenue,
                    boostProfiles: totalBoostRevenue,
                    byPlan: {
                        Gold: revByPlan.Gold || { revenue: 0, count: 0 },
                        Premium: revByPlan.Premium || { revenue: 0, count: 0 },
                    },
                    byBoost: {
                        '24 Hours': revByBoost['24 Hours'] || { revenue: 0, count: 0 },
                        '3 Days': revByBoost['3 Days'] || { revenue: 0, count: 0 },
                        '7 Days': revByBoost['7 Days'] || { revenue: 0, count: 0 },
                    }
                },
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== UPDATE ACCOUNT STATUS =====================
exports.updateUserAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountStatus } = req.body;
        if (!allowedAccountStatuses.includes(accountStatus)) {
            return res.status(400).json({ success: false, message: `Invalid accountStatus. Allowed values: ${allowedAccountStatuses.join(', ')}` });
        }
        const user = await User.findByIdAndUpdate(id, { accountStatus }, { new: true, runValidators: true }).select('-otp -otpExpires -lastOtpSentAt');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Audit log
        await createAuditLog({
            req,
            action: 'update_account_status',
            targetType: 'User',
            targetId: id,
            targetName: user.email || user.phone || '',
            changedFields: { accountStatus: true },
            previousValues: { accountStatus: user.accountStatus },
            newValues: { accountStatus },
            notes: `Account status changed to ${accountStatus}`
        });

        return res.status(200).json({ success: true, message: 'User account status updated successfully', data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== PENDING VERIFICATION =====================
exports.getPendingVerification = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = { adminStatus: 'pending' };
        if (req.query.search && req.query.search.trim()) {
            query.fullName = { $regex: req.query.search.trim(), $options: 'i' };
        }
        const profiles = await Profile.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Profile.countDocuments(query);
        const results = await Promise.all(profiles.map(async (p) => {
            const user = await User.findById(p.userId).select('-otp -otpExpires');
            return { profile: p, account: user || null };
        }));
        return res.status(200).json({
            success: true,
            count: results.length,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            currentPage: page,
            data: results
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== SUCCESSFUL MATCHES =====================
exports.getSuccessfulMatches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.search && req.query.search.trim()) {
            const searchRegex = { $regex: req.query.search.trim(), $options: 'i' };
            query.$or = [{ brideName: searchRegex }, { groomName: searchRegex }, { notes: searchRegex }];
        }
        const matches = await SuccessfulMatch.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await SuccessfulMatch.countDocuments(query);
        return res.status(200).json({
            success: true,
            count: matches.length,
            totalMatches: total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            currentPage: page,
            data: matches
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSuccessfulMatch = async (req, res) => {
    try {
        const { brideProfileId, groomProfileId, matchDate, status, notes } = req.body;
        const bride = brideProfileId ? await Profile.findById(brideProfileId) : null;
        const groom = groomProfileId ? await Profile.findById(groomProfileId) : null;
        if (brideProfileId && !bride) return res.status(404).json({ success: false, message: 'Bride profile not found' });
        if (groomProfileId && !groom) return res.status(404).json({ success: false, message: 'Groom profile not found' });
        const match = await SuccessfulMatch.create({
            brideProfileId: brideProfileId || null,
            groomProfileId: groomProfileId || null,
            brideName: bride ? (bride.fullName || 'Unknown') : (req.body.brideName || 'Unknown'),
            groomName: groom ? (groom.fullName || 'Unknown') : (req.body.groomName || 'Unknown'),
            bridePhoto: bride && bride.profilePhotos && bride.profilePhotos[0] ? bride.profilePhotos[0].url : '',
            groomPhoto: groom && groom.profilePhotos && groom.profilePhotos[0] ? groom.profilePhotos[0].url : '',
            matchDate: matchDate ? new Date(matchDate) : new Date(),
            status: status || 'confirmed',
            notes: notes || '',
            createdBy: req.user ? req.user._id.toString() : ''
        });
        return res.status(201).json({ success: true, message: 'Match created successfully', data: match });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSuccessfulMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {};
        if (req.body.status !== undefined) updateData.status = req.body.status;
        if (req.body.notes !== undefined) updateData.notes = req.body.notes;
        if (req.body.matchDate !== undefined) updateData.matchDate = new Date(req.body.matchDate);
        const match = await SuccessfulMatch.findByIdAndUpdate(id, updateData, { new: true });
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        return res.status(200).json({ success: true, message: 'Match updated', data: match });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSuccessfulMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const match = await SuccessfulMatch.findByIdAndDelete(id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        return res.status(200).json({ success: true, message: 'Match deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== REPORTED PROFILES =====================
exports.getReportedProfiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.search && req.query.search.trim()) {
            query.reportedName = { $regex: req.query.search.trim(), $options: 'i' };
        }
        const reports = await ReportedProfile.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await ReportedProfile.countDocuments(query);
        return res.status(200).json({
            success: true,
            count: reports.length,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            currentPage: page,
            data: reports
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createReportedProfile = async (req, res) => {
    try {
        const { reportedProfileId, reportedBy, reason, description } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: 'Reason is required' });
        const profile = reportedProfileId ? await Profile.findById(reportedProfileId) : null;
        const report = await ReportedProfile.create({
            reportedProfileId: reportedProfileId || null,
            reportedName: profile ? (profile.fullName || 'Unknown') : 'Unknown',
            reportedPhoto: profile && profile.profilePhotos && profile.profilePhotos[0] ? profile.profilePhotos[0].url : '',
            reportedBy: reportedBy || '',
            reason,
            description: description || '',
            status: 'pending'
        });
        return res.status(201).json({ success: true, message: 'Report created', data: report });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateReportedProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const update = {};
        if (req.body.status !== undefined) update.status = req.body.status;
        if (req.body.adminNotes !== undefined) update.adminNotes = req.body.adminNotes;
        const report = await ReportedProfile.findByIdAndUpdate(id, update, { new: true });
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        return res.status(200).json({ success: true, message: 'Report updated', data: report });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== SUBSCRIBERS =====================
exports.getSubscribers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { planName, boostType } = req.query;
        let results = [];
        let total = 0;

        if (boostType) {
            const query = { status: 'Success', planType: boostType };
            const boosts = await ProfileBoost.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
            total = await ProfileBoost.countDocuments(query);
            results = await Promise.all(boosts.map(async (b) => {
                const user = await User.findById(b.userId).select('-otp -otpExpires');
                const profile = await Profile.findOne({ userId: b.userId });
                return { subscription: b, account: user || null, profile: profile || null };
            }));
        } else if (planName) {
            const query = { paymentStatus: 'completed', planName };
            const subs = await Subscription.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
            total = await Subscription.countDocuments(query);
            results = await Promise.all(subs.map(async (s) => {
                const user = await User.findById(s.userId).select('-otp -otpExpires');
                const profile = await Profile.findOne({ userId: s.userId });
                return { subscription: s, account: user || null, profile: profile || null };
            }));
        } else {
            const query = { membershipType: { $ne: 'Free' } };
            const profiles = await Profile.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
            total = await Profile.countDocuments(query);
            results = await Promise.all(profiles.map(async (p) => {
                const user = await User.findById(p.userId).select('-otp -otpExpires');
                return { profile: p, account: user || null };
            }));
        }

        return res.status(200).json({
            success: true,
            count: results.length,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            currentPage: page,
            data: results
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== REVENUE ANALYTICS =====================
exports.getRevenueAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setFullYear(now.getFullYear() - 1);

        const [monthlySub, monthlyBoost] = await Promise.all([
            Subscription.aggregate([
                { $match: { paymentStatus: 'completed', createdAt: { $gte: twelveMonthsAgo } } },
                { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            ProfileBoost.aggregate([
                { $match: { status: 'Success', createdAt: { $gte: twelveMonthsAgo } } },
                { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])
        ]);

        const monthlyData = {};
        monthlySub.forEach((item) => {
            const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
            monthlyData[key] = { subscriptions: item.total, boosts: 0, month: key };
        });
        monthlyBoost.forEach((item) => {
            const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
            if (!monthlyData[key]) monthlyData[key] = { subscriptions: 0, boosts: 0, month: key };
            monthlyData[key].boosts = item.total;
        });

        const sortedMonthly = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

        return res.status(200).json({
            success: true,
            data: { monthlyTrend: sortedMonthly }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== EXPORT USERS (with filters) =====================
exports.exportUsers = async (req, res) => {
    try {
        const format = req.query.format || 'csv';
        let userQuery = {};
        const profileFilters = {};

        // Apply same filters as getAllUsers
        if (req.query.status) userQuery.accountStatus = req.query.status;
        if (req.query.membershipType) profileFilters.membershipType = req.query.membershipType;
        if (req.query.gender) profileFilters.gender = req.query.gender;
        if (req.query.approveStatus) profileFilters.adminStatus = req.query.approveStatus;
        if (req.query.religion) profileFilters.religion = new RegExp(`^${req.query.religion}$`, 'i');
        if (req.query.state) profileFilters.state = new RegExp(`^${req.query.state}$`, 'i');
        if (req.query.city) profileFilters.city = new RegExp(`^${req.query.city}$`, 'i');
        if (req.query.education) profileFilters.highestEducation = new RegExp(`^${req.query.education}$`, 'i');
        if (req.query.minAge || req.query.maxAge) {
            const today = new Date();
            const minAge = parseInt(req.query.minAge) || 18;
            const maxAge = parseInt(req.query.maxAge) || 80;
            profileFilters.dob = {
                $gte: new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate()),
                $lte: new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()),
            };
        }
        if (req.query.dateFrom || req.query.dateTo) {
            userQuery.createdAt = {};
            if (req.query.dateFrom) userQuery.createdAt.$gte = new Date(req.query.dateFrom);
            if (req.query.dateTo) userQuery.createdAt.$lte = new Date(req.query.dateTo + 'T23:59:59Z');
        }

        if (Object.keys(profileFilters).length > 0) {
            const fp = await Profile.find(profileFilters).select('userId');
            const ids = fp.map((p) => p.userId);
            if (ids.length === 0) {
                return res.status(200).send('No records found for the given filters');
            }
            userQuery._id = { $in: ids };
        }

        const users = await User.find(userQuery).select('-otp -otpExpires -password').lean();
        const profilesList = await Profile.find(
            Object.keys(profileFilters).length > 0 ? { userId: userQuery._id } : {}
        ).lean();
        const profilesMap = {};
        profilesList.forEach((p) => { profilesMap[p.userId.toString()] = p; });

        const rows = users.map((u) => {
            const p = profilesMap[u._id.toString()] || {};
            return {
                Name: p.fullName || '',
                Email: u.email || '',
                Phone: u.phone || '',
                Gender: p.gender || '',
                Age: p.dob ? Math.floor((Date.now() - new Date(p.dob)) / 31536000000) : '',
                Religion: p.religion || '',
                Community: p.community || '',
                Membership: p.membershipType || 'Free',
                'Account Status': u.accountStatus || '',
                'Approval Status': p.adminStatus || '',
                Education: p.highestEducation || '',
                City: p.city || '',
                State: p.state || '',
                Registered: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '',
            };
        });

        const headers = Object.keys(rows[0] || {});
        if (format === 'csv') {
            const csvLines = [headers.join(','), ...rows.map((row) =>
                headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
            )];
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=users_export_${Date.now()}.csv`);
            return res.send(csvLines.join('\n'));
        } else if (format === 'xlsx') {
            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Users');
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=users_export_${Date.now()}.xlsx`);
            return res.send(buffer);
        } else {
            const lines = ['RVR Luxury Matrimony - Users Export', '', headers.join(','), ...rows.map((row) => Object.values(row).join(','))];
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename=users_export_${Date.now()}.txt`);
            return res.send(lines.join('\n'));
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== ADMIN MANAGEMENT (Super Admin Only) =====================
exports.listAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}).select('-password').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: admins.length, data: admins });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAdminAccount = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });
        }
        const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Admin already exists with this email' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const allowedRole = ['admin', 'super_admin'].includes(role) ? role : 'admin';
        const newAdmin = await Admin.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: allowedRole,
        });
        await createAuditLog({
            req,
            action: 'create_admin',
            targetType: 'Admin',
            targetId: newAdmin._id,
            targetName: newAdmin.email,
            newValues: { name: newAdmin.name, email: newAdmin.email, role: newAdmin.role },
            notes: `New admin account created`
        });
        return res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role, createdAt: newAdmin.createdAt }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAdminAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, password } = req.body;

        // Prevent super admin from demoting themselves
        if (req.user._id.toString() === id && role && role !== 'super_admin') {
            return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
        }

        const adminToUpdate = await Admin.findById(id);
        if (!adminToUpdate) return res.status(404).json({ success: false, message: 'Admin not found' });

        const previousValues = { name: adminToUpdate.name, role: adminToUpdate.role };
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (role && ['admin', 'super_admin'].includes(role)) updateData.role = role;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updated = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        await createAuditLog({
            req,
            action: 'update_admin',
            targetType: 'Admin',
            targetId: id,
            targetName: updated.email,
            previousValues,
            newValues: { name: updated.name, role: updated.role },
            notes: `Admin account updated`
        });
        return res.status(200).json({ success: true, message: 'Admin updated', data: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAdminAccount = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user._id.toString() === id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
        }
        const admin = await Admin.findByIdAndDelete(id);
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
        await createAuditLog({
            req,
            action: 'delete_admin',
            targetType: 'Admin',
            targetId: id,
            targetName: admin.email,
            previousValues: { name: admin.name, email: admin.email, role: admin.role },
            notes: `Admin account deleted`
        });
        return res.status(200).json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== AUDIT LOGS =====================
exports.getAuditLogs = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip  = (page - 1) * limit;
        const query = {};
        if (req.query.adminId) query.adminId = req.query.adminId;
        if (req.query.action)  query.action  = req.query.action;
        const logs  = await AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await AuditLog.countDocuments(query);
        return res.status(200).json({
            success: true,
            count: logs.length,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            currentPage: page,
            data: logs
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== RESET USER PASSWORD (Super Admin) =====================
exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        // Send email notification
        try {
            await transporter.sendMail({
                from: FROM,
                to: user.email,
                subject: 'Your RVR Matrimony password has been reset',
                html: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#FBF6ED;border-radius:16px">
                  <h2 style="color:#2D2424">Password Reset</h2>
                  <p style="color:#555">Your account password has been reset by an administrator.</p>
                  <div style="background:#fff;border-radius:12px;padding:16px;margin:20px 0;border:1px solid #F2E9DE">
                    <p style="margin:0;color:#888;font-size:12px">New Password</p>
                    <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#2D2424;letter-spacing:2px">${newPassword}</p>
                  </div>
                  <p style="color:#888;font-size:12px">Please log in and change your password immediately.</p>
                </div>`,
            });
        } catch (emailErr) {
            console.error('Reset password email error:', emailErr.message);
        }

        await createAuditLog({
            req,
            action: 'reset_password',
            targetType: 'User',
            targetId: id,
            targetName: user.email,
            changedFields: { password: true },
            previousValues: {},
        });

        return res.status(200).json({ success: true, message: 'Password reset successfully. Email sent to user.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ===================== EDIT USER PROFILE (Admin Direct Edit) =====================
const ADMIN_EDITABLE_PROFILE_FIELDS = [
    'fullName', 'dob', 'gender', 'height', 'physicalStatus', 'maritalStatus', 'numberOfChildren',
    'childrenLivingTogether', 'diet', 'profileCreatedFor', 'language', 'motherTongue',
    'religion', 'community', 'subCommunity', 'bio', 'aboutFamily', 'fathersOccupation',
    'mothersOccupation', 'brothers', 'sisters', 'marriedSiblings', 'familyIncomeRange',
    'familyStatus', 'familyType', 'drinkingHabits', 'smokingHabits', 'openToPets',
    'ownHouse', 'ownCar', 'hobbies', 'interests', 'country', 'state', 'city',
    'citizenship', 'residentStatus', 'highestEducation', 'degree', 'profession',
    'aboutCareer', 'describeMe', 'annualIncome', 'companyName',
    'rashi', 'nakshatra', 'gothram', 'birthTime', 'birthPlace', 'manglik',
    'adminStatus', 'adminRemarks', 'membershipType', 'isFeatured',
];

const buildAdminEditEmail = (name, email, changes, adminName) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FBF6ED;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <tr><td style="background:linear-gradient(135deg,#2D2424,#6E2F2F);padding:28px 32px;text-align:center">
    <p style="margin:0;color:#E3B450;font-size:11px;letter-spacing:3px;text-transform:uppercase">RVR Luxury Matrimony</p>
    <h1 style="margin:8px 0 0;color:#fff;font-size:22px">Profile Updated by Admin</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#555;margin:0 0 16px">Dear <strong>${name || 'Member'}</strong>,</p>
    <p style="color:#555;margin:0 0 20px">Your profile has been updated by our admin team. Here are the changes made:</p>
    <table width="100%" cellpadding="10" style="border:1px solid #F2E9DE;border-radius:12px;margin-bottom:24px;border-collapse:collapse">
      <tr style="background:#FBF6ED"><td style="font-weight:bold;color:#2D2424;font-size:13px;text-transform:uppercase">Field</td><td style="font-weight:bold;color:#2D2424;font-size:13px;text-transform:uppercase">New Value</td></tr>
      ${changes.map(([field, val]) => `<tr><td style="color:#888;font-size:13px;border-top:1px solid #F2E9DE;text-transform:capitalize">${field.replace(/([A-Z])/g, ' $1').trim()}</td><td style="color:#2D2424;font-size:13px;border-top:1px solid #F2E9DE">${val}</td></tr>`).join('')}
    </table>
    <p style="color:#888;font-size:12px;margin:0 0 24px">If you believe these changes are incorrect, please contact our support team.</p>
    <div style="text-align:center"><a href="${SITE_URL}/profile/edit" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E3B450,#CAA043);color:#2D2424;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px">View My Profile</a></div>
  </td></tr>
  <tr><td style="background:#FBF6ED;padding:20px;text-align:center;border-top:1px solid #F2E9DE">
    <p style="margin:0;color:#aaa;font-size:11px">RVR Luxury Matrimony · Admin Team</p>
  </td></tr>
</table></td></tr></table></body></html>`;

exports.editUserProfile = async (req, res) => {
    try {
        const { id } = req.params; // userId
        const updates = req.body;

        const user = await User.findById(id).select('-password -otp');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const profile = await Profile.findOne({ userId: id });
        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found for this user' });

        // Filter to only allowed fields
        const profileUpdates = {};
        const changedFields = [];
        ADMIN_EDITABLE_PROFILE_FIELDS.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(updates, field) && updates[field] !== undefined) {
                profileUpdates[field] = updates[field];
                changedFields.push([field, String(updates[field]).substring(0, 80)]);
            }
        });

        if (Object.keys(profileUpdates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        const prevValues = {};
        changedFields.forEach(([f]) => { prevValues[f] = profile[f]; });

        Object.assign(profile, profileUpdates);
        await profile.save();

        // Send email notification
        if (user.email && changedFields.length > 0) {
            try {
                await transporter.sendMail({
                    from: FROM,
                    to: user.email,
                    subject: 'Your RVR Matrimony profile has been updated',
                    html: buildAdminEditEmail(profile.fullName, user.email, changedFields, req.user?.name || 'Admin'),
                });
            } catch (emailErr) { console.error('Admin edit email error:', emailErr.message); }
        }

        await createAuditLog({
            req,
            action: 'admin_edit_profile',
            targetType: 'Profile',
            targetId: profile._id,
            targetName: profile.fullName || user.email,
            changedFields: Object.fromEntries(changedFields.map(([f]) => [f, true])),
            previousValues: prevValues,
            newValues: profileUpdates,
            notes: `Admin directly edited ${changedFields.length} field(s)`,
        });

        return res.status(200).json({
            success: true,
            message: `Profile updated. ${user.email ? 'Email notification sent.' : 'No email on file.'}`,
            data: profile,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== REQUEST USER TO EDIT SENSITIVE FIELDS =====================
const buildRequestEditEmail = (name, field, remarks, adminName) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FBF6ED;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <tr><td style="background:linear-gradient(135deg,#8B6914,#E3B450);padding:28px 32px;text-align:center">
    <p style="margin:0;color:#2D2424;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.8">RVR Luxury Matrimony</p>
    <h1 style="margin:8px 0 0;color:#2D2424;font-size:22px">Action Required on Your Profile</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#555;margin:0 0 16px">Dear <strong>${name || 'Member'}</strong>,</p>
    <p style="color:#555;margin:0 0 16px">Our admin team has requested you to update your <strong>${field}</strong> on your profile.</p>
    <div style="background:#FBF6ED;border-left:4px solid #E3B450;border-radius:8px;padding:16px;margin-bottom:24px">
      <p style="margin:0;color:#2D2424;font-size:13px;font-weight:bold">Admin Notes:</p>
      <p style="margin:6px 0 0;color:#555;font-size:14px">${remarks || 'Please update this information at your earliest convenience.'}</p>
    </div>
    <p style="color:#555;margin:0 0 24px">Please log in and update your profile. If you have questions, contact support.</p>
    <div style="text-align:center"><a href="${SITE_URL}/profile/edit" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E3B450,#CAA043);color:#2D2424;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px">Update My Profile</a></div>
  </td></tr>
  <tr><td style="background:#FBF6ED;padding:20px;text-align:center;border-top:1px solid #F2E9DE">
    <p style="margin:0;color:#aaa;font-size:11px">RVR Luxury Matrimony · Admin Team</p>
  </td></tr>
</table></td></tr></table></body></html>`;

exports.requestUserEdit = async (req, res) => {
    try {
        const { id } = req.params;
        const { field, remarks } = req.body;

        if (!field) return res.status(400).json({ success: false, message: 'Field name is required' });

        const user = await User.findById(id).select('-password -otp');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const profile = await Profile.findOne({ userId: id });
        const name = profile?.fullName || user.email || 'Member';

        if (!user.email) {
            return res.status(400).json({ success: false, message: 'User has no email address on file' });
        }

        await transporter.sendMail({
            from: FROM,
            to: user.email,
            subject: `Action Required: Please update your ${field} on RVR Matrimony`,
            html: buildRequestEditEmail(name, field, remarks, req.user?.name || 'Admin'),
        });

        await createAuditLog({
            req,
            action: 'request_user_edit',
            targetType: 'User',
            targetId: id,
            targetName: user.email,
            changedFields: { [field]: true },
            previousValues: {},
            newValues: { requestedField: field, remarks },
            notes: `Admin requested user to edit: ${field}`,
        });

        return res.status(200).json({ success: true, message: `Edit request email sent to ${user.email}` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== BAN / UNBAN USER (with email notification) =====================
const buildBanEmail = (name, reason) => `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FBF6ED;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <tr><td style="background:linear-gradient(135deg,#7f1d1d,#c0392b);padding:28px 32px;text-align:center">
    <p style="margin:0;color:#fff;font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:.8">RVR Luxury Matrimony</p>
    <h1 style="margin:8px 0 0;color:#fff;font-size:22px">Account Suspended</h1>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="color:#555;margin:0 0 16px">Dear <strong>${name || 'Member'}</strong>,</p>
    <p style="color:#555;margin:0 0 16px">Your RVR Luxury Matrimony account has been <strong style="color:#c0392b">suspended</strong> by our admin team.</p>
    ${reason ? `<div style="background:#FFF5F5;border-left:4px solid #c0392b;border-radius:8px;padding:16px;margin-bottom:20px"><p style="margin:0;color:#c0392b;font-size:13px"><strong>Reason:</strong> ${reason}</p></div>` : ''}
    <p style="color:#888;font-size:13px;margin:0 0 24px">If you believe this is a mistake, please contact our support team immediately.</p>
    <div style="text-align:center"><a href="mailto:${process.env.EMAIL_USER || 'support@rvrluxury.com'}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#E3B450,#CAA043);color:#2D2424;font-weight:bold;text-decoration:none;border-radius:8px;font-size:15px">Contact Support</a></div>
  </td></tr>
</table></td></tr></table></body></html>`;

exports.banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, action } = req.body; // action: 'ban' | 'unban'

        const isBanning = action !== 'unban';
        const newStatus = isBanning ? 'suspended' : 'active';

        const user = await User.findByIdAndUpdate(id, { accountStatus: newStatus }, { new: true }).select('-password -otp');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const profile = await Profile.findOne({ userId: id });

        if (isBanning && user.email) {
            try {
                await transporter.sendMail({
                    from: FROM,
                    to: user.email,
                    subject: 'Your RVR Matrimony account has been suspended',
                    html: buildBanEmail(profile?.fullName || user.email, reason),
                });
            } catch (emailErr) { console.error('Ban email error:', emailErr.message); }
        }

        await createAuditLog({
            req,
            action: isBanning ? 'ban_user' : 'unban_user',
            targetType: 'User',
            targetId: id,
            targetName: user.email || '',
            changedFields: { accountStatus: true },
            previousValues: { accountStatus: isBanning ? 'active' : 'suspended' },
            newValues: { accountStatus: newStatus },
            notes: isBanning ? `Banned. Reason: ${reason || 'N/A'}` : 'Account reactivated',
        });

        return res.status(200).json({
            success: true,
            message: isBanning ? 'User banned and notified by email.' : 'User account reactivated.',
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ===================== DELETE USER (Hard Delete) =====================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password -otp');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const profile = await Profile.findOne({ userId: id });
        const name = profile?.fullName || user.email || 'Member';
        const email = user.email;

        // Hard delete profile + user
        if (profile) await Profile.findByIdAndDelete(profile._id);
        await User.findByIdAndDelete(id);

        // Send farewell email
        if (email) {
            try {
                await transporter.sendMail({
                    from: FROM,
                    to: email,
                    subject: 'Your RVR Matrimony account has been deleted',
                    html: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;padding:32px;background:#FBF6ED;border-radius:16px;text-align:center">
                      <h2 style="color:#2D2424">Account Deleted</h2>
                      <p style="color:#555">Dear ${name},</p>
                      <p style="color:#555">Your RVR Luxury Matrimony account and all associated data have been permanently deleted by our admin team.</p>
                      <p style="color:#888;font-size:12px;margin-top:24px">If this was a mistake, please contact our support team immediately.</p>
                    </div>`,
                });
            } catch (emailErr) { console.error('Delete user email error:', emailErr.message); }
        }

        await createAuditLog({
            req,
            action: 'delete_user',
            targetType: 'User',
            targetId: id,
            targetName: email || name,
            changedFields: {},
            previousValues: {},
            newValues: {},
            notes: `User hard-deleted. Name: ${name}, Email: ${email}`,
        });

        return res.status(200).json({ success: true, message: 'User and profile permanently deleted.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
