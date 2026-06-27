const express = require('express');
const router = express.Router();
const { getProfileById, updateProfile, updatePreferences, getMyProfile, deletePhotoById, getProfileSummary, deleteMyProfile } = require('../controllers/profileController');

const { uploadPhotos } = require('../controllers/profileController');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middlewares/authMiddleware');
const { getDashboardHeaderStats } = require('../controllers/userController');

// All profile routes are protected
router.put('/update', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.post('/upload-photos', protect, upload.array('images', 5), uploadPhotos);
router.delete('/photo/:photoId', protect, deletePhotoById);
router.delete('/me', protect, deleteMyProfile);
router.get('/summary', protect, getProfileSummary);
router.get('/me', protect, getMyProfile);
router.get('/dashboard-summary', protect, getDashboardHeaderStats);
// @route   GET /api/profile/user/:id
// @desc    Get any user's profile by ID and track the view
// @access  Private
router.get('/user/:id', protect, getProfileById);
module.exports = router;
