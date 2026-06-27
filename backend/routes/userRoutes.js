const express = require('express');
const router = express.Router();
const { getDashboardHeaderStats } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/user/dashboard-stats
 * @desc    Get counts for New Matches, Interests, and Unread Messages
 * @access  Private (Requires Token)
 */
router.get('/dashboard-stats', protect, getDashboardHeaderStats);

module.exports = router;