const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipientId: req.user.id,
            recipientModel: 'User'
        })
            .sort({ createdAt: -1 }) // Newest first
            .limit(20)
            .populate('senderId');

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Mark all notifications as read for the logged-in user
exports.markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { recipientId: req.user.id, recipientModel: 'User', isRead: false }, // Filter: sirf unread waali
            { $set: { isRead: true } }                   // Action: read mark kar do
        );

        res.status(200).json({ 
            success: true, 
            message: `${result.modifiedCount} notifications marked as read` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipientId: req.user.id,
            recipientModel: 'User'
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// @desc    Delete a specific notification
exports.deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;

        // Notification dhundo aur check karo ki woh isi user ki hai ya nahi
        const notification = await Notification.findOne({
            _id: notificationId,
            recipientId: req.user.id,
            recipientModel: 'User' // Security: Only owner can delete
        });

        if (!notification) {
            return res.status(404).json({ 
                success: false, 
                message: "Notification not found or unauthorized" 
            });
        }

        await notification.deleteOne();

        res.status(200).json({ 
            success: true, 
            message: "Notification deleted successfully" 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdminNotifications = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
        const skip = (page - 1) * limit;

        const query = {
            recipientId: req.user.id,
            recipientModel: 'Admin'
        };

        const [notifications, totalNotifications] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('senderId'),
            Notification.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            count: notifications.length,
            totalNotifications,
            totalPages: Math.ceil(totalNotifications / limit),
            currentPage: page,
            data: notifications
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}; 

exports.markAllAdminNotificationsAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            {
                recipientId: req.user.id,
                recipientModel: 'Admin',
                isRead: false
            },
            { $set: { isRead: true } }
        );

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} admin notifications marked as read`
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.markAdminNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipientId: req.user.id,
            recipientModel: 'Admin'
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        notification.isRead = true;
        await notification.save();

        return res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAdminNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipientId: req.user.id,
            recipientModel: 'Admin'
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or unauthorized"
            });
        }

        await notification.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
