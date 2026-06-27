const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

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
