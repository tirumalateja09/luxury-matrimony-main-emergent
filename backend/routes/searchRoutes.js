const express = require('express');
const router = express.Router();
const { advancedSearch, getJustJoinedPreview, getSuggestedProfiles } = require('../controllers/searchController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/advanced', protect, advancedSearch);
router.get('/just-joined-preview', protect, getJustJoinedPreview);
router.get('/suggested', protect, getSuggestedProfiles);

module.exports = router;