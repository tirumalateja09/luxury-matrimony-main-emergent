const Profile = require('../models/Profile');
const PartnerPreference = require('../models/PartnerPreference');
const Interest = require('../models/Interest');
const Shortlist = require('../models/Shortlist');
const ChatRequest = require('../models/ChatRequest');
const { INCOME_SLABS } = require('../config/constants');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeString = (value) => toTrimmedString(value).toLowerCase();
const normalizeStringArray = (values) => Array.isArray(values)
    ? values.map((value) => normalizeString(value)).filter(Boolean)
    : [];

const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }

    return age;
};

const EDUCATION_PRIORITY = {
    'class x or below': 1,
    'class xii': 2,
    'diploma/certifications': 3,
    "graduate/bachelor's": 4,
    "post graduate/master's": 5,
    'professional / finance': 6,
    'civil services / elite': 7,
    'doctorate': 8
};

const isLocationMatch = (preferenceLocation, candidateProfile, currentUser) => {
    const normalizedLocation = normalizeString(preferenceLocation);

    if (!normalizedLocation || normalizedLocation === 'anywhere') {
        return true;
    }

    if (normalizedLocation === 'same city') {
        return normalizeString(candidateProfile.city) === normalizeString(currentUser.city);
    }

    if (normalizedLocation === 'abroad') {
        const candidateCountry = normalizeString(candidateProfile.country);
        return Boolean(candidateCountry) && candidateCountry !== 'india';
    }

    return false;
};

const calculatePreferenceScore = (candidateProfile, currentUser, preferences) => {
    if (!preferences) return null;

    let totalChecks = 0;
    let matchedChecks = 0;

    if (preferences.prefAgeRange?.min !== undefined || preferences.prefAgeRange?.max !== undefined) {
        const candidateAge = calculateAge(candidateProfile.dob);
        if (candidateAge !== null) {
            totalChecks += 1;
            const minAge = Number(preferences.prefAgeRange.min) || 18;
            const maxAge = Number(preferences.prefAgeRange.max) || 100;
            if (candidateAge >= minAge && candidateAge <= maxAge) matchedChecks += 1;
        }
    }

    if (preferences.prefHeightRange?.min !== undefined || preferences.prefHeightRange?.max !== undefined) {
        const candidateHeight = Number(candidateProfile.height);
        if (!Number.isNaN(candidateHeight) && candidateHeight > 0) {
            totalChecks += 1;
            const minHeight = Number(preferences.prefHeightRange.min) || 0;
            const maxHeight = Number(preferences.prefHeightRange.max) || 300;
            if (candidateHeight >= minHeight && candidateHeight <= maxHeight) matchedChecks += 1;
        }
    }

    const preferredMaritalStatuses = normalizeStringArray(preferences.prefMaritalStatus);
    if (preferredMaritalStatuses.length > 0) {
        totalChecks += 1;
        if (preferredMaritalStatuses.includes(normalizeString(candidateProfile.maritalStatus))) matchedChecks += 1;
    }

    const preferredCommunities = normalizeStringArray(preferences.prefCommunities);
    if (preferredCommunities.length > 0) {
        totalChecks += 1;
        if (preferredCommunities.includes(normalizeString(candidateProfile.community))) matchedChecks += 1;
    }

    const preferredLanguages = normalizeStringArray(preferences.prefLanguages);
    if (preferredLanguages.length > 0) {
        totalChecks += 1;
        if (preferredLanguages.includes(normalizeString(candidateProfile.motherTongue))) matchedChecks += 1;
    }

    if (preferences.prefLocation) {
        totalChecks += 1;
        if (isLocationMatch(preferences.prefLocation, candidateProfile, currentUser)) matchedChecks += 1;
    }

    if (preferences.minEducation) {
        const preferredEducationRank = EDUCATION_PRIORITY[normalizeString(preferences.minEducation)];
        const candidateEducationRank = EDUCATION_PRIORITY[normalizeString(candidateProfile.highestEducation)];

        if (preferredEducationRank && candidateEducationRank) {
            totalChecks += 1;
            if (candidateEducationRank >= preferredEducationRank) matchedChecks += 1;
        }
    }

    if (preferences.preferredProfession) {
        totalChecks += 1;
        if (normalizeString(candidateProfile.profession) === normalizeString(preferences.preferredProfession)) matchedChecks += 1;
    }

    if (preferences.annualIncomeRange) {
        const preferredIncomeIndex = INCOME_SLABS.findIndex((slab) => normalizeString(slab) === normalizeString(preferences.annualIncomeRange));
        const candidateIncomeIndex = INCOME_SLABS.findIndex((slab) => normalizeString(slab) === normalizeString(candidateProfile.annualIncome));

        if (preferredIncomeIndex >= 0 && candidateIncomeIndex >= 0) {
            totalChecks += 1;
            if (candidateIncomeIndex >= preferredIncomeIndex) matchedChecks += 1;
        }
    }

    if (preferences.horoscopeMatch) {
        totalChecks += 1;
        if (normalizeString(candidateProfile.manglik) === normalizeString(currentUser.manglik)) matchedChecks += 1;
    }

    if (preferences.gothramMatch) {
        totalChecks += 1;
        if (normalizeString(candidateProfile.gothram) === normalizeString(currentUser.gothram)) matchedChecks += 1;
    }

    if (totalChecks === 0) return null;

    return {
        matchScore: Math.round((matchedChecks / totalChecks) * 100),
        matchedChecks,
        totalChecks
    };
};

// @desc    Advanced Search with UI Filters, Time-based Sorting & Plan Restrictions
// @route   POST /api/search/advanced
exports.advancedSearch = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await Profile.findOne({ userId });

        if (!currentUser) {
            return res.status(403).json({
                success: false,
                message: "Please complete your profile registration first."
            });
        } 

        // 1. Extract Pagination and Filters from Request Body
        // Default: Page 1, Limit 20 profiles per request
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 20;
        const skip = (page - 1) * limit;

        const { fullName,
            minAge, maxAge, minHeight, maxHeight, maritalStatus, religion,
            community, subCommunity, motherTongue, city, state, annualIncome,
            highestEducation, profession, diet, manglik,
            filterType // 'new', 'premium_only', 'featured', 'verified', 'topmatch'
        } = req.body;
        const normalizedFilterType = typeof filterType === 'string'
            ? filterType.trim().toLowerCase()
            : '';
        // 2. Base Query (Opposite Gender + Approved Profiles + Excluding Self)
        let query = {
            userId: { $ne: userId },
            gender: currentUser.gender === 'Male' ? 'Female' : 'Male',
            adminStatus: 'approved'
        };
        //  FULLNAME SEARCH LOGIC (Case-Insensitive Regex)
        if (fullName) {
            query.fullName = { $regex: fullName, $options: 'i' };
        }
        // 3. Basic Filters (Available for all plans)
        if (minAge || maxAge) {
            const today = new Date();
            const minDate = new Date(today.getFullYear() - (maxAge || 70), today.getMonth(), today.getDate());
            const maxDate = new Date(today.getFullYear() - (minAge || 18), today.getMonth(), today.getDate());
            query.dob = { $gte: minDate, $lte: maxDate };
        }

        const religionValue = toTrimmedString(religion);
        const cityValue = toTrimmedString(city);
        const communityValue = toTrimmedString(community);
        const subCommunityValue = toTrimmedString(subCommunity);
        const motherTongueValue = toTrimmedString(motherTongue);
        const stateValue = toTrimmedString(state);
        const maritalStatusValue = toTrimmedString(maritalStatus);
        const dietValue = toTrimmedString(diet);
        const manglikValue = toTrimmedString(manglik);
        const highestEducationValue = toTrimmedString(highestEducation);
        const professionValue = toTrimmedString(profession);
        const annualIncomeValue = toTrimmedString(annualIncome);

        if (religionValue) query.religion = { $regex: `^${escapeRegex(religionValue)}$`, $options: 'i' };
        if (cityValue) query.city = { $regex: `^${escapeRegex(cityValue)}$`, $options: 'i' };

        // 4. Advanced Filters
        if (minHeight || maxHeight) {
            query.height = { $gte: Number(minHeight) || 0, $lte: Number(maxHeight) || 250 };
        }
        if (communityValue) query.community = { $regex: `^${escapeRegex(communityValue)}$`, $options: 'i' };
        if (subCommunityValue) query.subCommunity = { $regex: `^${escapeRegex(subCommunityValue)}$`, $options: 'i' };
        if (motherTongueValue) query.motherTongue = { $regex: `^${escapeRegex(motherTongueValue)}$`, $options: 'i' };
        if (stateValue) query.state = { $regex: `^${escapeRegex(stateValue)}$`, $options: 'i' };
        if (maritalStatusValue) query.maritalStatus = { $regex: `^${escapeRegex(maritalStatusValue)}$`, $options: 'i' };
        if (dietValue) query.diet = { $regex: `^${escapeRegex(dietValue)}$`, $options: 'i' };
        if (manglikValue) query.manglik = { $regex: `^${escapeRegex(manglikValue)}$`, $options: 'i' };
        if (highestEducationValue) query.highestEducation = { $regex: `^${escapeRegex(highestEducationValue)}$`, $options: 'i' };
        if (professionValue) query.profession = { $regex: `^${escapeRegex(professionValue)}$`, $options: 'i' };

        if (annualIncomeValue) {
            const normalizedIncome = annualIncomeValue.toLowerCase();
            const selectedIndex = INCOME_SLABS.findIndex((slab) => slab.toLowerCase() === normalizedIncome);
            if (selectedIndex >= 0) {
                const higherSlabs = INCOME_SLABS.slice(selectedIndex);
                query.annualIncome = { $in: higherSlabs };
            }
        }

        if (normalizedFilterType === 'featured') {
            query.isBoosted = true;
            query.boostExpiresAt = { $gt: new Date() };
        }

        if (normalizedFilterType === 'premium_only') {
            query.membershipType = { $in: ['Gold', 'Premium'] };
        }

        if (normalizedFilterType === 'new') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            query.createdAt = { $gte: oneWeekAgo };
        }

        // 5. Sorting Logic (Boosted and Featured profiles get priority)
        let sortLogic = { isBoosted: -1, isFeatured: -1, createdAt: -1 };
        if (normalizedFilterType === 'new') sortLogic = { createdAt: -1 };
        let totalMatches = 0;
        let matches = [];

        if (normalizedFilterType === 'topmatch') {
            const preferences = await PartnerPreference.findOne({ profileId: currentUser._id }).lean();

            const candidateProfiles = await Profile.find(query)
                .sort({ createdAt: -1 })
                .lean();

            const scoredProfiles = candidateProfiles.map((profile) => {
                const scoreDetails = calculatePreferenceScore(profile, currentUser, preferences);

                return {
                    ...profile,
                    matchScore: scoreDetails?.matchScore ?? 0,
                    matchedPreferenceCount: scoreDetails?.matchedChecks ?? 0,
                    totalPreferenceCount: scoreDetails?.totalChecks ?? 0
                };
            }).filter((profile) => profile.matchScore > 30);

            scoredProfiles.sort((a, b) => {
                if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
                if (b.matchedPreferenceCount !== a.matchedPreferenceCount) return b.matchedPreferenceCount - a.matchedPreferenceCount;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            totalMatches = scoredProfiles.length;
            matches = scoredProfiles.slice(skip, skip + limit);
        } else {
            totalMatches = await Profile.countDocuments(query);
            matches = await Profile.find(query)
                .sort(sortLogic)
                .skip(skip)
                .limit(limit)
                .lean();
        }

        const profileUserIds = matches.map((profile) => profile.userId);

        const [interestDocs, shortlistDoc, chatRequestDocs] = await Promise.all([
            Interest.find({
                senderId: userId,
                receiverId: { $in: profileUserIds }
            }).select('receiverId').lean(),
            Shortlist.findOne({ userId }).select('targetIds').lean(),
            ChatRequest.find({
                senderId: userId,
                receiverId: { $in: profileUserIds }
            }).select('receiverId').lean()
        ]);

        const interestSet = new Set(interestDocs.map((item) => String(item.receiverId)));
        const shortlistSet = new Set((shortlistDoc?.targetIds || []).map((id) => String(id)));
        const chatRequestSet = new Set(chatRequestDocs.map((item) => String(item.receiverId)));

        const enrichedMatches = matches.map((profile) => {
            const profileUserId = String(profile.userId);
            const isInterest = interestSet.has(profileUserId);
            const isShortlist = shortlistSet.has(profileUserId);
            const isChatRequest = chatRequestSet.has(profileUserId);

            return {
                ...profile,
                isInterest,
                isShortlist,
                isChatRequest
            };
        });

        res.status(200).json({
            success: true,
            results: enrichedMatches.length,
            totalProfiles: totalMatches,
            totalPages: Math.ceil(totalMatches / limit),
            currentPage: page,
            data: enrichedMatches
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// @desc    Get Latest 10 Profiles for Home Page Section (New to Old)
// @route   GET /api/search/just-joined-preview
// @desc    Get Latest 10 Profiles for Home Page Section (Full Details)
// @route   GET /api/search/just-joined-preview
exports.getJustJoinedPreview = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentUser = await Profile.findOne({ userId });

        // Security Check: If the current user hasn't set up a profile yet
        if (!currentUser) {
            return res.status(403).json({
                success: false,
                message: "Please complete your profile registration first."
            });
        }

        let query = {
            userId: { $ne: userId },
            gender: currentUser.gender === 'Male' ? 'Female' : 'Male',
            adminStatus: 'approved'
        };

        // Removed .select() to include all profile details
        const latestProfiles = await Profile.find(query)
            .sort({ createdAt: -1 }) // Newest to Oldest
            .limit(10)
            .lean();

        const profileUserIds = latestProfiles.map((profile) => profile.userId);

        const [interestDocs, shortlistDoc, chatRequestDocs] = await Promise.all([
            Interest.find({
                senderId: userId,
                receiverId: { $in: profileUserIds }
            }).select('receiverId').lean(),
            Shortlist.findOne({ userId }).select('targetIds').lean(),
            ChatRequest.find({
                senderId: userId,
                receiverId: { $in: profileUserIds }
            }).select('receiverId').lean()
        ]);

        const interestSet = new Set(interestDocs.map((item) => String(item.receiverId)));
        const shortlistSet = new Set((shortlistDoc?.targetIds || []).map((id) => String(id)));
        const chatRequestSet = new Set(chatRequestDocs.map((item) => String(item.receiverId)));

        const enrichedProfiles = latestProfiles.map((profile) => {
            const profileUserId = String(profile.userId);
            const isInterest = interestSet.has(profileUserId);
            const isShortlist = shortlistSet.has(profileUserId);
            const isChatRequest = chatRequestSet.has(profileUserId);

            return {
                ...profile,
                isInterest,
                isShortlist,
                isChatRequest,
             
            };
        });

        res.status(200).json({
            success: true,
            count: enrichedProfiles.length,
            data: enrichedProfiles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
