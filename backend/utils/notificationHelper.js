const Notification = require('../models/Notification');
const Admin = require('../models/Admin');

exports.createNotification = async (recipientId, senderId, type, title, description, options = {}) => {
    try {
        await Notification.create({
            recipientId,
            senderId,
            recipientModel: options.recipientModel || 'User',
            senderModel: senderId ? (options.senderModel || 'User') : undefined,
            type,
            title,
            description,
            message: description,
            relatedId: options.relatedId || null
        });
        // Yahan baad mein Socket.io ka logic aayega real-time alert ke liye
    } catch (error) {
        console.error("Notification Error:", error);
    }
};

exports.notifyAllAdmins = async ({ senderId, title, description, relatedId = null, senderModel = 'User' }) => {
    try {
        const admins = await Admin.find().select('_id');

        if (!admins.length) {
            return;
        }

        await Notification.insertMany(
            admins.map((admin) => ({
                recipientId: admin._id,
                recipientModel: 'Admin',
                senderId,
                senderModel,
                type: 'approval_request',
                title,
                description,
                message: description,
                relatedId
            }))
        );
    } catch (error) {
        console.error("Admin Notification Error:", error);
    }
};
