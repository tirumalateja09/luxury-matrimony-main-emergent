const express = require('express');
const router = express.Router();
const { 
    getMyNotifications, 
    markAsRead, 
    deleteNotification ,
    markAllAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// 1. Get all notifications for the logged-in user
router.get('/', protect, getMyNotifications);
router.put('/mark-all-read', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
// 3. Delete a notification
router.delete('/:id', protect, deleteNotification);

module.exports = router;