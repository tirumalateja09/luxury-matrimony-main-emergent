const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
    verifyUserProfile,
    getAllUsers,
    getUserDetailsById,
    getUserDetailsByProfileId,
    createUserManually,
    bulkCreateUsersFromExcel,
    updateUserAccountStatus,
    getAdminStats,
    getPendingVerification,
    getSuccessfulMatches,
    createSuccessfulMatch,
    updateSuccessfulMatch,
    deleteSuccessfulMatch,
    getReportedProfiles,
    createReportedProfile,
    updateReportedProfile,
    getSubscribers,
    getRevenueAnalytics,
    exportUsers,
} = require('../controllers/adminController');

const {
    getAdminNotifications,
    markAdminNotificationAsRead,
    deleteAdminNotification,
    markAllAdminNotificationsAsRead,
} = require('../controllers/notificationController');

const { getAllContactUsForAdmin } = require('../controllers/contactController');
const { adminProtect } = require('../middlewares/authMiddleware');
const { adminLogin, adminRegister, checkAdminTokenStatus } = require('../controllers/adminAuthController');

const upload = multer({ storage: multer.memoryStorage() });

// ===================== PUBLIC ROUTES =====================
router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.get('/token-status', checkAdminTokenStatus);

// ===================== NOTIFICATIONS =====================
router.get('/notifications', adminProtect, getAdminNotifications);
router.put('/notifications/mark-all-read', adminProtect, markAllAdminNotificationsAsRead);
router.put('/notifications/:id/read', adminProtect, markAdminNotificationAsRead);
router.delete('/notifications/:id', adminProtect, deleteAdminNotification);

// ===================== STATS & ANALYTICS =====================
router.get('/stats', adminProtect, getAdminStats);
router.get('/revenue', adminProtect, getRevenueAnalytics);

// ===================== EXPORT =====================
router.get('/export/users', adminProtect, exportUsers);

// ===================== USER MANAGEMENT =====================
router.get('/users', adminProtect, getAllUsers);

// IMPORTANT: specific routes MUST come before parameterized routes
router.post('/users/manual', adminProtect, createUserManually);
router.post('/users/bulk-upload', adminProtect, upload.single('file'), bulkCreateUsersFromExcel);
router.put('/users/:id/account-status', adminProtect, updateUserAccountStatus);

// user-details: specific path before parameterized
router.get('/user-details/profile/:profileId', adminProtect, getUserDetailsByProfileId);
router.get('/user-details/:id', adminProtect, getUserDetailsById);

// ===================== PROFILE VERIFICATION =====================
router.get('/pending-verification', adminProtect, getPendingVerification);
router.put('/verify-profile/:profileId', adminProtect, verifyUserProfile);

// ===================== SUCCESSFUL MATCHES =====================
router.get('/matches', adminProtect, getSuccessfulMatches);
router.post('/matches', adminProtect, createSuccessfulMatch);
router.put('/matches/:id', adminProtect, updateSuccessfulMatch);
router.delete('/matches/:id', adminProtect, deleteSuccessfulMatch);

// ===================== REPORTED PROFILES =====================
router.get('/reported-profiles', adminProtect, getReportedProfiles);
router.post('/reported-profiles', adminProtect, createReportedProfile);
router.put('/reported-profiles/:id', adminProtect, updateReportedProfile);

// ===================== SUBSCRIBERS =====================
router.get('/subscribers', adminProtect, getSubscribers);

// ===================== CONTACT US =====================
router.get('/contact-us', adminProtect, getAllContactUsForAdmin);

module.exports = router;
