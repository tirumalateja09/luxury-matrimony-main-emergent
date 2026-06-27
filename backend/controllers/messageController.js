const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Profile = require('../models/Profile');
const ReportedProfile = require('../models/ReportedProfile');
const transporter = require('../utils/emailConfig');

const FROM = `"RVR Luxury Matrimony" <${process.env.EMAIL_USER}>`;

// @desc    Send a message (API based)
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        const senderId = req.user.id;

        // 1. Fetch conversation to identify the other participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }
        const isParticipant = conversation.participants.some(
            (id) => id.toString() === senderId.toString()
        );
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: "Unauthorized access to this chat" });
        }
        // 2. Identify the receiverId (the participant who is not the current sender)
        const receiverId = conversation.participants.find(
            (id) => id.toString() !== senderId.toString()
        );

        // 3. Create a new message with receiverId for tracking unread counts on Dashboard
        const message = await Message.create({
            conversationId,
            senderId,
            receiverId,
            text
        });

        // 4. Update the Conversation model with the latest message ID for easier sorting
        conversation.lastMessage = message._id;
        await conversation.save();

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all messages for a specific conversation & auto-update read status
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        // Security Check: verify  user is part of  chat 
        const conversation = await Conversation.findById(conversationId);

        const isParticipant = conversation && conversation.participants.some(
            (id) => id.toString() === userId.toString()
        );
        if (!isParticipant) {
            return res.status(403).json({ success: false, message: "Access Denied: You cannot view these messages" });
        }
        // 1. Update 'isRead' status for all incoming messages in this conversation
        // This ensures the "Unread Messages" count on the User Dashboard is updated instantly
        await Message.updateMany(
            { conversationId, receiverId: userId, isRead: false },
            { $set: { isRead: true } }
        );

        // 2. Retrieve all messages for the chat window
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 }) // Sorting from oldest to newest (ascending)
            .populate('senderId', 'email phone');

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Report abuse from chat with last 5 messages as evidence
// @route   POST /api/messages/report
// @access  Private
exports.reportAbuse = async (req, res) => {
    try {
        const reporterUserId = req.user.id;
        const { conversationId, reportedUserId, reason, description } = req.body;

        if (!conversationId || !reportedUserId || !reason) {
            return res.status(400).json({ success: false, message: 'conversationId, reportedUserId, and reason are required.' });
        }

        // Verify reporter is part of conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });
        const isParticipant = conversation.participants.some((id) => id.toString() === reporterUserId.toString());
        if (!isParticipant) return res.status(403).json({ success: false, message: 'You are not part of this conversation.' });

        // Get last 5 messages as evidence
        const last5 = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        const evidence = last5.reverse().map((m) => ({
            senderId: m.senderId,
            content: m.text,
            sentAt: m.createdAt,
        }));

        // Get reported user's profile
        const reportedProfile = await Profile.findOne({ userId: reportedUserId }).lean();
        const reporterProfile = await Profile.findOne({ userId: reporterUserId }).lean();

        // Save report
        const report = await ReportedProfile.create({
            reportedProfileId: reportedProfile?._id,
            reportedName: reportedProfile?.fullName || 'Unknown',
            reportedPhoto: reportedProfile?.photos?.[0] || '',
            reportedByUserId: reporterUserId,
            reportedBy: reporterProfile?.fullName || 'Anonymous',
            reason,
            description: description || '',
            source: 'chat',
            evidenceMessages: evidence,
        });

        // Email admin
        const adminEmail = process.env.SUPER_ADMIN_EMAIL;
        if (adminEmail) {
            try {
                const evidenceHtml = evidence.map((m) =>
                    `<tr><td style="padding:6px 10px;border-bottom:1px solid #f0e8e8;font-size:12px;color:#555">${new Date(m.sentAt).toLocaleString('en-IN')}</td>
                     <td style="padding:6px 10px;border-bottom:1px solid #f0e8e8;font-size:12px;color:#333">${m.content}</td></tr>`
                ).join('');
                await transporter.sendMail({
                    from: FROM,
                    to: adminEmail,
                    subject: `[Abuse Report] ${reportedProfile?.fullName || 'Unknown'} reported by ${reporterProfile?.fullName || 'User'}`,
                    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:24px;background:#FBF6ED;border-radius:12px">
                      <h2 style="color:#C0392B;margin-bottom:4px">New Abuse Report</h2>
                      <p style="color:#888;margin:0 0 20px;font-size:12px">Submitted via chat</p>
                      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;margin-bottom:20px">
                        <tr><td style="padding:10px;background:#f9f0f0;font-weight:bold;font-size:12px;color:#888;text-transform:uppercase">Reported User</td><td style="padding:10px">${reportedProfile?.fullName || 'Unknown'}</td></tr>
                        <tr><td style="padding:10px;background:#f9f0f0;font-weight:bold;font-size:12px;color:#888;text-transform:uppercase">Reported By</td><td style="padding:10px">${reporterProfile?.fullName || 'Anonymous'}</td></tr>
                        <tr><td style="padding:10px;background:#f9f0f0;font-weight:bold;font-size:12px;color:#888;text-transform:uppercase">Reason</td><td style="padding:10px;color:#C0392B;font-weight:bold">${reason}</td></tr>
                        <tr><td style="padding:10px;background:#f9f0f0;font-weight:bold;font-size:12px;color:#888;text-transform:uppercase">Description</td><td style="padding:10px">${description || '—'}</td></tr>
                      </table>
                      <h3 style="color:#2D2424;font-size:13px;text-transform:uppercase;letter-spacing:1px">Last 5 Chat Messages (Evidence)</h3>
                      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden">
                        <tr style="background:#2D2424"><th style="padding:8px 10px;color:#E3B450;font-size:11px;text-align:left">Time</th><th style="padding:8px 10px;color:#E3B450;font-size:11px;text-align:left">Message</th></tr>
                        ${evidenceHtml}
                      </table>
                    </div>`,
                });
            } catch (emailErr) {
                console.error('Abuse report email error:', emailErr.message);
            }
        }

        return res.status(201).json({ success: true, message: 'Report submitted successfully.', reportId: report._id });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
