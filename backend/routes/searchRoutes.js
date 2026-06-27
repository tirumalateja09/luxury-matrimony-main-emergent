const express = require('express');
const router = express.Router();
const { advancedSearch, getJustJoinedPreview } = require('../controllers/searchController');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/search/advanced
// @desc    Perform advanced search with premium filters and sorting
// @access  Private (Needs Token)
router.post('/advanced', protect, advancedSearch);

// @route   GET /api/search/just-joined-preview
// @desc    Get top 10 newest profiles for the Home Page
// @access  Private (Needs Token)
router.get('/just-joined-preview', protect, getJustJoinedPreview);

module.exports = router;