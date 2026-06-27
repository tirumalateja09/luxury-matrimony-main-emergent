const ChatRequest = require("../models/ChatRequest");
const Profile = require("../models/Profile");
const { createNotification } = require("../utils/notificationHelper");
const Conversation = require("../models/Conversation");

exports.sendChatRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    // 1. Fetch Sender's Profile to check plan and status
    const senderProfile = await Profile.findOne({ userId: senderId });

    if (!senderProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    // 2. BLOCK FREE USERS (Frame 456.png Logic)
    if (senderProfile.membershipType === "Free") {
      return res.status(403).json({
        success: false,
        message:
          "Free users cannot send chat requests. Please upgrade to Gold or Premium!",
        upgradeRequired: true,
      });
    }

    // 3. GOLD USER DAILY LIMIT (Rolling 24 Hours)
    if (senderProfile.membershipType === "Gold") {
      const GOLD_LIMIT = Number(process.env.GOLD_DAILY_CHAT_LIMIT) || 10;

      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const requestsToday = await ChatRequest.countDocuments({
        senderId,
        createdAt: { $gte: twentyFourHoursAgo },
      });

      if (requestsToday >= GOLD_LIMIT) {
        return res.status(403).json({
          success: false,
          message: `Daily limit of ${GOLD_LIMIT} chat requests reached for Gold members. Upgrade to Premium for unlimited!`,
          upgradeRequired: true,
        });
      }
    }

    // Note: Premium users have no check here, so they get unlimited

    // 4. Basic Validation Checks
    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot request yourself" });
    }

    const existingRequest = await ChatRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Request already exists",
        status: existingRequest.status,
      });
    }

    // 5. Create Request
    const newRequest = await ChatRequest.create({
      senderId,
      receiverId,
      status: "pending",
    });
    await createNotification(
      receiverId,
      senderId,
      "interest_received",
      "New Chat Request",
      `${senderProfile.fullName} wants to chat with you.`,
    );
    res.status(201).json({
      success: true,
      message: "Chat request sent successfully",
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await ChatRequest.find({
      receiverId: req.user.id,
      status: "pending",
    }).populate({
      path: "senderId",
      model: "Profile", // Batana padega ki data 'Profile' model se lana hai
      localField: "senderId",
      foreignField: "userId", // Profile model mein 'userId' matches ChatRequest's 'senderId'
      select: "fullName profilePhotos city dob",
    });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSentRequests = async (req, res) => {
  const requests = await ChatRequest.find({
    senderId: req.user.id,
    status: "pending",
  }).populate({
    path: "receiverId",
    model: "Profile", // Batana padega ki data 'Profile' model se lana hai
    localField: "receiverId",
    foreignField: "userId", // Profile model mein 'userId' matches ChatRequest's 'senderId'
    select: "fullName profilePhotos city dob",
  });

  // .populate('receiverId', 'fullName profilePhotos city');
  res.status(200).json({ success: true, data: requests });
};

exports.getAcceptedChats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch conversations where I am a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "lastMessage",
        select: "text senderId receiverId createdAt isRead",
      })
      .sort({ updatedAt: -1 })
      .lean();

    if (!conversations.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Extract other userIds
    const otherUserIds = conversations.map((c) =>
      c.participants.find((id) => id.toString() !== userId),
    );

    // 3. Fetch profiles of other users
    const profiles = await Profile.find({
      userId: { $in: otherUserIds },
    }).select("userId fullName gender profilePhotos dob height city community highestEducation degree annualIncome profession religion");

    // 4. Map profiles by userId
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    // 5. Fetch unread counts for each conversation
    const Message = require("../models/Message");
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: conversations.map(c => c._id) },
          receiverId: userId,
          isRead: false
        }
      },
      {
        $group: {
          _id: "$conversationId",
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = {};
    unreadCounts.forEach(u => {
      unreadMap[u._id.toString()] = u.count;
    });

    // 6. Build final response
    const result = conversations.map((conversation) => {
      const otherUserId = conversation.participants.find(
        (id) => id.toString() !== userId,
      );

      return {
        conversation, // ✅ full conversation object
        otherProfile: profileMap[otherUserId.toString()] || null,
        unread: unreadMap[conversation._id.toString()] || 0
      };
    });

    res.status(200).json({
      success: true,
      data: result.filter((r) => r.otherProfile),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accepted' or 'rejected'

    const request = await ChatRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Security check: Sirf receiver hi accept/reject kar sake
    if (request.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    request.status = action;
    await request.save();

    // --- CHAT CONVERSATION LOGIC START ---
    if (action === "accepted") {
      // Check if conversation already exists between these two users
      let conversation = await Conversation.findOne({
        participants: { $all: [request.senderId, request.receiverId] },
      });

      // Agar nahi hai, toh nayi banayein
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [request.senderId, request.receiverId],
        });
      }

      // Notification sirf acceptance par
      await createNotification(
        request.senderId,
        req.user.id,
        "interest_accepted",
        "Request Accepted",
        `Great news! Your chat request was accepted.`,
      );
    }
    // --- CHAT CONVERSATION LOGIC END ---

    res.status(200).json({
      success: true,
      message: `Request ${action} successfully`,
      data: action === "accepted" ? { requestId } : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
