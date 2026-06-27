const Interest = require('../models/Interest');
const Profile = require('../models/Profile');
const Shortlist = require('../models/Shortlist');
const ChatRequest = require('../models/ChatRequest');
const Conversation = require('../models/Conversation');
const { createNotification } = require('../utils/notificationHelper');

exports.sendInterest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        // 1. Basic Validation
        if (senderId === receiverId) {
            return res.status(400).json({ 
                success: false, 
                message: "You cannot send interest to your own profile." 
            });
        }

        // 2. Fetch Sender's Profile for plan check
        const senderProfile = await Profile.findOne({ userId: senderId });
        if (!senderProfile) {
            return res.status(404).json({ success: false, message: "Sender profile not found." });
        }

        if (senderProfile.adminStatus !== 'approved') {
            return res.status(403).json({
                success: false,
                message: "Your profile is not admin approved yet. You can send interest only after approval."
            });
        }

        // 3. Daily Limit Check for FREE Users
        if (senderProfile.membershipType === 'Free') {
            const DAILY_LIMIT = Number(process.env.DAILY_INTEREST_LIMIT) || 5;

            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            const todayInterestCount = await Interest.countDocuments({
                senderId,
                createdAt: { $gte: twentyFourHoursAgo }
            });

            if (todayInterestCount >= DAILY_LIMIT) {
                return res.status(403).json({
                    success: false,
                    message: `You have reached your daily limit of ${DAILY_LIMIT} interests. Please upgrade your plan for unlimited connections!`,
                    upgradeRequired: true
                });
            }
        }

        // 4. FIX: Check for existing interest in BOTH directions
        const existingInterest = await Interest.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId }, // I already sent it
                { senderId: receiverId, receiverId: senderId }  // They already sent it to me
            ]
        });

        if (existingInterest) {
            // Case A: You already sent it
            if (existingInterest.senderId.toString() === senderId) {
                return res.status(400).json({ 
                    success: false, 
                    message: "You have already sent an interest request to this user." 
                });
            } 
            // Case B: They already sent it (avoiding your duplicate data issue)
            else {
                return res.status(400).json({ 
                    success: false, 
                    message: "This user has already sent you an interest. Please check your 'Received' list to accept it." 
                });
            }
        }

        // 5. Create new interest
        await Interest.create({ senderId, receiverId, status: 'pending' });

        // 6. Trigger Notification
        await createNotification(
            receiverId,
            senderId,
            'interest_received',
            'New Interest Received',
            `${senderProfile.fullName || 'Someone'} has expressed interest in your profile!`
        );

        res.status(201).json({ 
            success: true, 
            message: "Interest request sent successfully." 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Accept or Decline a received interest
exports.respondToInterest = async (req, res) => {
    try {
        const { interestId } = req.params;
        // Changed 'action' to 'status' to match common API standards
        const { status } = req.body; 

        // 1. Validate the status value
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid status. Please use 'accepted' or 'rejected'." 
            });
        }

        const interest = await Interest.findById(interestId);

        if (!interest) {
            return res.status(404).json({ success: false, message: "Interest request not found" });
        }

        // 2. Security: Ensure only the receiver can respond
        if (interest.receiverId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can only respond to interests sent to you." });
        }

        // 3. Update status
        interest.status = status;
        await interest.save();

        // 4. Send Notification if accepted
        if (status === 'accepted') {
            const receiverProfile = await Profile.findOne({ userId: req.user.id });

            await createNotification(
                interest.senderId,
                req.user.id,
                'interest_accepted',
                'Interest Accepted! ðŸŽ‰',
                `${receiverProfile?.fullName || 'Someone'} has accepted your interest. You can now view their details!`
            );
        }

        res.status(200).json({
            success: true,
            message: `Interest ${status} successfully.`,
            data: interest
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Interests for specific tabs (Accepted, Sent, Received)
exports.getInterestsByTab = async (req, res) => {
    try {
        const userId = req.user.id;
        const { tab } = req.query; // accepted, sent, received

        let query = {};
        // We don't need populateField anymore since we are manually fetching profiles
        
        if (tab === 'received') {
            query = { receiverId: userId, status: 'pending' };
        } else if (tab === 'sent') {
            query = { senderId: userId, status: 'pending' };
        } else if (tab === 'accepted') {
            query = {
                $or: [{ senderId: userId }, { receiverId: userId }],
                status: 'accepted'
            };
        } else {
            return res.status(400).json({ success: false, message: "Invalid tab" });
        }

        const interests = await Interest.find(query)
            .lean(); // Use lean() for better performance

        const otherUserIds = interests.map((item) => {
            if (tab === 'received') return item.senderId;
            if (tab === 'sent') return item.receiverId;
            return item.senderId.toString() === userId ? item.receiverId : item.senderId;
        });

        const [interestDocs, shortlistDoc, chatRequestDocs] = await Promise.all([
            Interest.find({
                senderId: userId,
                receiverId: { $in: otherUserIds }
            }).select('receiverId').lean(),
            Shortlist.findOne({ userId }).select('targetIds').lean(),
            ChatRequest.find({
                senderId: userId,
                receiverId: { $in: otherUserIds }
            }).select('receiverId').lean()
        ]);

        const interestSet = new Set(interestDocs.map((item) => String(item.receiverId)));
        const shortlistSet = new Set((shortlistDoc?.targetIds || []).map((id) => String(id)));
        const chatRequestSet = new Set(chatRequestDocs.map((item) => String(item.receiverId)));

        // Fetch detailed profiles
        const detailedInterests = await Promise.all(interests.map(async (item, index) => {
            // Identify whose profile to fetch (the "other" person)
            const otherUserId = otherUserIds[index];

            const profile = await Profile.findOne({ userId: otherUserId })
                // ðŸ‘‡ ADDED 'userId' HERE
                .select('userId fullName dob height city community profession annualIncome profilePhotos degree highestEducation membershipType adminStatus')
                .lean(); // Converts Mongoose Document to plain JS Object

            let conversationId = null;
            if (tab === 'accepted') {
                const conversation = await Conversation.findOne({
                    participants: { $all: [userId, otherUserId] }
                }).select('_id').lean();

                conversationId = conversation ? conversation._id : null;
            }

            const otherUserIdStr = String(otherUserId);
            const isInterest = interestSet.has(otherUserIdStr);
            const isShortlist = shortlistSet.has(otherUserIdStr);
            const isChatRequest = chatRequestSet.has(otherUserIdStr);

            return {
                interestId: item._id,
                status: item.status,
                createdAt: item.createdAt,
                profile: profile ? {
                    ...profile,
                    conversationId,
                    isInterest,
                    isShortlist,
                    isChatRequest
                } : null
            };
        })); 

        res.status(200).json({
            success: true,
            count: detailedInterests.length,
            data: detailedInterests
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
