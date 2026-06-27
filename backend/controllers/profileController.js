const Profile = require("../models/Profile");
const PartnerPreference = require("../models/PartnerPreference");
const ViewLog = require("../models/ViewLog");
const Subscription = require("../models/Subscription");
const Interest = require("../models/Interest");
const Shortlist = require("../models/Shortlist");
const ChatRequest = require("../models/ChatRequest");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const ProfileBoost = require("../models/ProfileBoost");
const User = require("../models/User");
const { notifyAllAdmins } = require("../utils/notificationHelper");

const allowedProfileFields = [
  "fullName",
  "dob",
  "height",
  "gender",
  "maritalStatus",
  "diet",
  "motherTongue",
  "religion",
  "community",
  "subCommunity",
  "bio",
  "aboutFamily",
  "fathersOccupation",
  "mothersOccupation",
  "brothers",
  "sisters",
  "marriedSiblings",
  "familyIncomeRange",
  "familyType",
  "drinkingHabits",
  "smokingHabits",
  "openToPets",
  "ownHouse",
  "ownCar",
  "hobbies",
  "interests",
  "country",
  "state",
  "city",
  "lat",
  "long",
  "citizenship",
  "residentStatus",
  "highestEducation",
  "degree",
  "profession",
  "aboutCareer",
  "annualIncome",
  "companyName",
  "describeMe",
  "rashi",
  "nakshatra",
  "gothram",
  "birthTime",
  "birthPlace",
  "manglik",
  "idProofUrl",
  "verificationSelfieUrl",
  "profileCreatedFor",
  "familyStatus",
  "physicalStatus",
  "numberOfChildren",
  "childrenLivingTogether",
];

const pickAllowedFields = (payload, allowed) => {
  const filtered = {};
  allowed.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      filtered[field] = payload[field];
    }
  });
  return filtered;
};

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
};

const calculateProfileStrength = (profile) => {
  const strengthFields = [
    profile.fullName,
    profile.dob,
    profile.height,
    profile.gender,
    profile.maritalStatus,
    profile.diet,
    profile.motherTongue,
    profile.religion,
    profile.community,
    profile.country,
    profile.state,
    profile.city,
    profile.highestEducation,
    profile.profession,
    profile.annualIncome,
    profile.idProofUrl,
    profile.verificationSelfieUrl,
    profile.profilePhotos,
  ];

  const completed = strengthFields.filter(hasValue).length;
  return Math.round((completed / strengthFields.length) * 100);
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "yes", "on"].includes(normalized);
  }
  return false;
};

// @desc    Update Profile Details (Step-by-Step)
// @route   PUT /api/profile/update
// @access  Private (User must be logged in)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get from Auth Middleware
    const updateData = pickAllowedFields(req.body, allowedProfileFields);

    if (updateData.maritalStatus === "Never Married") {
      updateData.numberOfChildren = null;
      updateData.childrenLivingTogether = null;
    }

    if (updateData.country === "India") {
      updateData.citizenship = null;
      updateData.residentStatus = null;
    }

    let profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Partner Preferences (Step 6 - Separate Model)
// @route   PUT /api/profile/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Please create profile first" });
    }

    const preferences = await PartnerPreference.findOneAndUpdate(
      { profileId: profile._id },
      { $set: req.body },
      { new: true, upsert: true }, // Create if doesn't exist
    );

    res.status(200).json({
      success: true,
      message: "Partner preferences saved",
      data: preferences,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Profile Photos
// @route   POST /api/profile/upload-photos
exports.uploadPhotos = async (req, res) => {
  try {
    const userId = req.user.id;
    const setUploadedAsMain = parseBoolean(req.body?.isMain);

    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload at least one image" });
    }

    // Map Cloudinary results to your Model structure
    const newPhotos = req.files.map((file, index) => ({
      url: file.path,
      isMain: setUploadedAsMain && index === 0,
    }));

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    if (setUploadedAsMain) {
      profile.profilePhotos.forEach((photo) => {
        photo.isMain = false;
      });
    }

    profile.profilePhotos.push(...newPhotos);
    if (profile.adminStatus === "rejected") {
      profile.adminStatus = "pending";
    }
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully to Cloudinary",
      photos: profile.profilePhotos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a profile photo by photoId
// @route   DELETE /api/profile/photo/:photoId
// @access  Private
exports.deletePhotoById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const photoExists = profile.profilePhotos.some(
      (photo) => photo._id.toString() === photoId,
    );

    if (!photoExists) {
      return res
        .status(404)
        .json({ success: false, message: "Photo not found" });
    }

    profile.profilePhotos.pull({ _id: photoId });
    if (profile.adminStatus === "rejected") {
      profile.adminStatus = "pending";
      const account = await User.findById(userId).select("email phone");
      const userLabel = profile.fullName || account?.email || account?.phone || "A user";

      await notifyAllAdmins({
        senderId: userId,
        title: "Profile approval request",
        description: `${userLabel} sent you an approval request.`,
        relatedId: profile._id,
      });
    }
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Photo deleted successfully",
      photos: profile.profilePhotos,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get profile summary card data
// @route   GET /api/profile/summary
// @access  Private
exports.getProfileSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ userId }).select(
      "userId fullName profilePhotos membershipType adminStatus dob birthTime lat long height gender maritalStatus diet motherTongue religion community country state city highestEducation profession annualIncome idProofUrl verificationSelfieUrl",
    );

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const [latestSubscription, user] = await Promise.all([
      Subscription.findOne({ userId }).sort({ createdAt: -1 }).select("planName"),
      User.findById(userId).select("accountStatus"),
    ]);

    const mainPhoto =
      profile.profilePhotos?.find((photo) => photo.isMain)?.url ||
      profile.profilePhotos?.[0]?.url ||
      null;

    const completionPercentage = calculateProfileStrength(profile);

    return res.status(200).json({
      success: true,
      data: {
        userId: profile.userId,
        fullName: profile.fullName || null,
        dob: profile.dob || null,
        birthTime: profile.birthTime || null,
        lat: profile.lat ?? null,
        long: profile.long ?? null,
        subscription:
          latestSubscription?.planName || profile.membershipType || "Free",
        adminStatus: profile.adminStatus || "pending",
        accountStatus: user?.accountStatus || "pending",
        profileStrength: `${completionPercentage}%`,
        completionPercentage,
        profilePhoto: mainPhoto,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From Auth Middleware
    const profile = await Profile.findOne({ userId }).populate(
      "userId",
      "phone email accountStatus ,isVerified",
    );

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const partnerPreferences = await PartnerPreference.findOne({
      profileId: profile._id,
    });

    res.status(200).json({
      success: true,
      data: {
        profile,
        partnerPreferences: partnerPreferences || {},
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Profile & Log View
exports.getProfileById = async (req, res) => {
  try {
    const targetUserId = req.params.id; // Frontend se user ID
    const viewerId = req.user.id; // Logged in user ID

    // 1. Fetch the target profile
    const profile = await Profile.findOne({ userId: targetUserId });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    // 2. Fetch Partner Preferences using profile._id
    const [
      partnerPreferences,
      interestDoc,
      shortlistDoc,
      chatRequestDoc,
      user,
    ] =
      await Promise.all([
        PartnerPreference.findOne({ profileId: profile._id }),
        Interest.findOne({
          senderId: viewerId,
          receiverId: targetUserId,
        })
          .select("_id")
          .lean(),
        Shortlist.findOne({
          userId: viewerId,
          targetIds: targetUserId,
        })
          .select("_id")
          .lean(),
        // ChatRequest.findOne({
        //     senderId: viewerId,
        //     receiverId: targetUserId
        // }).select('_id').lean()
        ChatRequest.findOne({
          $or: [
            { senderId: viewerId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: viewerId },
          ],
        })
          .select("_id")
          .lean(),
        User.findById(targetUserId)
          .select(
            "_id fullName email phone profileImage authProvider accountStatus isVerified createdAt updatedAt",
          )
          .lean(),
      ]);

    const profileWithFlags = {
      ...profile.toObject(),
      isInterest: Boolean(interestDoc),
      isShortlist: Boolean(shortlistDoc),
      isChatRequest: Boolean(chatRequestDoc),
    };

    // 3. UNIQUE VIEW LOGIC (No change here)
    if (viewerId !== targetUserId) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const existingView = await ViewLog.findOne({
        viewerId: viewerId,
        viewedId: targetUserId,
        viewedAt: { $gte: twentyFourHoursAgo },
      });

      if (!existingView) {
        await ViewLog.create({
          viewerId: viewerId,
          viewedId: targetUserId,
          viewedAt: new Date(),
        });
      }
    }

    // 4. Send combined response
    res.status(200).json({
      success: true,
      data: {
        profile: profileWithFlags,
        user: user || null,
        partnerPreferences: partnerPreferences || {},
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Delete Logged-in User Profile and All Associated Data
// @route   DELETE /api/profile/me
// @access  Private
exports.deleteMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find the profile first to get profile._id for related deletions
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const profileId = profile._id;

    // 2. Delete Profile and associated data in parallel for efficiency
    await Promise.all([
      // Primary profile data
      Profile.deleteOne({ userId }),
      PartnerPreference.deleteOne({ profileId }),

      // Interactions (where current user is either sender or receiver)
      Interest.deleteMany({
        $or: [{ senderId: userId }, { receiverId: userId }],
      }),
      ChatRequest.deleteMany({
        $or: [{ senderId: userId }, { receiverId: userId }],
      }),
      Message.deleteMany({
        $or: [{ senderId: userId }, { receiverId: userId }],
      }),

      // Logs and lists
      Shortlist.deleteMany({ userId }),
      Shortlist.updateMany({}, { $pull: { targetIds: userId } }), // Remove me from others' shortlists

      ViewLog.deleteMany({
        $or: [{ viewerId: userId }, { viewedId: userId }],
      }),

      Notification.deleteMany({ recipientId: userId }),

      // Subscriptions and Boosts
      Subscription.deleteMany({ userId }),
      ProfileBoost.deleteMany({ userId }),
    ]);

    // Note: Conversations are tricky because they might have another participant.
    // Usually, we might want to keep the conversation but mark a participant as 'deleted'
    // or simply delete conversations where this user was a participant if they are now empty.
    // For simplicity, we'll delete conversations where this user was a participant.
    await Conversation.deleteMany({ participants: profileId });

    // 3. Soft Delete User Account
    await User.findByIdAndUpdate(userId, { accountStatus: "deleted" });

    res.status(200).json({
      success: true,
      message: "Profile and all associated data deleted successfully. Account deactivated.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
