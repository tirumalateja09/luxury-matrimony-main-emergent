const Interest = require("../models/Interest");
const Message = require("../models/Message");
const Profile = require("../models/Profile");

exports.getDashboardHeaderStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch User Profile for Membership & Gender
        const myProfile = await Profile.findOne({ userId })
            .select('gender membershipType adminStatus');

        if (!myProfile) {
            return res.status(404).json({ success: false, message: "Profile not found" });
        }

        // 2. Unread Messages Count
        const unreadCount = await Message.countDocuments({
            receiverId: userId,
            isRead: false
        });

        // 3. Pending Interests Count
        const interestsCount = await Interest.countDocuments({
            receiverId: userId,
            status: 'pending'
        });

        // 4. New Matches Count (Last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const matchesCount = await Profile.countDocuments({
            gender: myProfile.gender === 'Male' ? 'Female' : 'Male',
            adminStatus: 'approved',
            createdAt: { $gte: oneWeekAgo }
        });

        // 5. Response with Premium Info
        res.status(200).json({
            success: true,
            data: {
                membershipType: myProfile.membershipType, // 'Free', 'Gold', or 'Premium'
                adminStatus: myProfile.adminStatus,     // To show 'Verified' badge
                newMatchesCount: matchesCount,
                interestsReceivedCount: interestsCount,
                messagesCount: unreadCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};