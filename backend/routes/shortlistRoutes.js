const express = require('express');
const router = express.Router();
const { toggleShortlist, getShortlistedProfiles } = require('../controllers/shortlistController');
const { protect } = require('../middlewares/authMiddleware'); // Plural used here

// Both routes require the user to be logged in
router.post('/toggle', protect, toggleShortlist);
router.get('/my-list', protect, getShortlistedProfiles);

module.exports = router;