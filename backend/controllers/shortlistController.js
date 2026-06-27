const Shortlist = require("../models/Shortlist");
const Profile = require("../models/Profile");
const Interest = require("../models/Interest");
const { createNotification } = require("../utils/notificationHelper");

// @desc    Add or Remove profile from Shortlist (Toggle Logic)
// @route   POST /api/shortlist/toggle
const mongoose = require("mongoose");

exports.toggleShortlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId, action } = req.body;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: "Target ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Target ID",
      });
    }

    if (targetId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot shortlist your own profile",
      });
    }

    if (!["add", "remove"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'add' or 'remove'",
      });
    }

    const objectTargetId = new mongoose.Types.ObjectId(targetId);
    const senderProfile = await Profile.findOne({ userId }).select("fullName");

    let shortlist = await Shortlist.findOne({ userId });

    // If no shortlist document exists
    if (!shortlist) {
      if (action === "remove") {
        return res.status(400).json({
          success: false,
          message: "Profile is not in shortlist",
        });
      }

      // create new document for add
      shortlist = await Shortlist.create({
        userId,
        targetIds: [objectTargetId],
      });

      await createNotification(
        targetId,
        userId,
        "shortlist_received",
        "New Shortlist",
        `${senderProfile?.fullName || "Someone"} shortlisted you`,
      );

      return res.status(200).json({
        success: true,
        message: "Added to shortlist",
      });
    }

    const alreadyExists = shortlist.targetIds.some(
      (id) => id.toString() === targetId,
    );

    if (action === "add") {
      if (alreadyExists) {
        return res.status(200).json({
          success: true,
          message: "Already shortlisted",
        });
      }

      shortlist.targetIds.push(objectTargetId);
      await shortlist.save();

      await createNotification(
        targetId,
        userId,
        "shortlist_received",
        "New Shortlist",
        `${senderProfile?.fullName || "Someone"} shortlisted you`,
      );

      return res.status(200).json({
        success: true,
        message: "Added to shortlist",
      });
    }

    if (action === "remove") {
      if (!alreadyExists) {
        return res.status(200).json({
          success: true,
          message: "Profile is not in shortlist",
        });
      }

      shortlist.targetIds = shortlist.targetIds.filter(
        (id) => id.toString() !== targetId,
      );

      await shortlist.save();

      return res.status(200).json({
        success: true,
        message: "Removed from shortlist",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all Shortlisted Profiles with full details
// @route   GET /api/shortlist/my-list
exports.getShortlistedProfiles = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find the shortlist document for this user
    const shortlist = await Shortlist.findOne({ userId });
    if (!shortlist || shortlist.targetIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const targetIds = shortlist.targetIds;

    const [profiles, interestDocs] = await Promise.all([
      Profile.find({
        userId: { $in: targetIds },
      }).select(
        "userId fullName dob height city community religion profession annualIncome profilePhotos membershipType adminStatus",
      ),
      Interest.find({
        senderId: userId,
        receiverId: { $in: targetIds },
      }).select("receiverId").lean(),
    ]);

    const interestSet = new Set(interestDocs.map((item) => String(item.receiverId)));
    const enrichedProfiles = profiles.map((profile) => {
      const profileUserId = String(profile.userId);
      return {
        ...profile.toObject(),
        isInterest: interestSet.has(profileUserId),
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedProfiles.length,
      data: enrichedProfiles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
