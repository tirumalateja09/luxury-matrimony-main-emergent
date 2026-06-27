const express = require('express');
const router = express.Router();
const { getProfileViewsAnalytics } = require('../controllers/viewController');
const { protect } = require('../middlewares/authMiddleware');

// Get view statistics and viewer list
router.get('/my-views', protect, getProfileViewsAnalytics);

module.exports = router;