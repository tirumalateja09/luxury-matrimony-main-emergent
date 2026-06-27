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
    listAdmins,
    createAdminAccount,
    updateAdminAccount,
    deleteAdminAccount,
    getAuditLogs,
} = require('../controllers/adminController');

const {
    getAdminNotifications,
    markAdminNotificationAsRead,
    deleteAdminNotification,
    markAllAdminNotificationsAsRead,
} = require('../controllers/notificationController');

const { getAllContactUsForAdmin } = require('../controllers/contactController');
const { adminProtect, requireSuperAdmin } = require('../middlewares/authMiddleware');
const { adminLogin, adminRegister, checkAdminTokenStatus } = require('../controllers/adminAuthController');

const upload = multer({ storage: multer.memoryStorage() });

// ===================== PUBLIC ROUTES =====================
router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.get('/token-status', checkAdminTokenStatus);

// ===================== NOTIFICATIONS (both roles) =====================
router.get('/notifications', adminProtect, getAdminNotifications);
router.put('/notifications/mark-all-read', adminProtect, markAllAdminNotificationsAsRead);
router.put('/notifications/:id/read', adminProtect, markAdminNotificationAsRead);
router.delete('/notifications/:id', adminProtect, deleteAdminNotification);

// ===================== STATS (both roles) =====================
router.get('/stats', adminProtect, getAdminStats);

// ===================== REVENUE & EXPORT (super_admin only) =====================
router.get('/revenue', adminProtect, requireSuperAdmin, getRevenueAnalytics);
router.get('/export/users', adminProtect, requireSuperAdmin, exportUsers);

// ===================== USER MANAGEMENT (both roles) =====================
router.get('/users', adminProtect, getAllUsers);

// Specific routes BEFORE parameterized routes
router.post('/users/manual', adminProtect, createUserManually);
router.post('/users/bulk-upload', adminProtect, upload.single('file'), bulkCreateUsersFromExcel);
router.put('/users/:id/account-status', adminProtect, updateUserAccountStatus);

// user-details: specific before parameterized
router.get('/user-details/profile/:profileId', adminProtect, getUserDetailsByProfileId);
router.get('/user-details/:id', adminProtect, getUserDetailsById);

// ===================== PROFILE VERIFICATION (both roles) =====================
router.get('/pending-verification', adminProtect, getPendingVerification);
router.put('/verify-profile/:profileId', adminProtect, verifyUserProfile);

// ===================== SUCCESSFUL MATCHES (both roles) =====================
router.get('/matches', adminProtect, getSuccessfulMatches);
router.post('/matches', adminProtect, createSuccessfulMatch);
router.put('/matches/:id', adminProtect, updateSuccessfulMatch);
router.delete('/matches/:id', adminProtect, deleteSuccessfulMatch);

// ===================== REPORTED PROFILES (both roles) =====================
router.get('/reported-profiles', adminProtect, getReportedProfiles);
router.post('/reported-profiles', adminProtect, createReportedProfile);
router.put('/reported-profiles/:id', adminProtect, updateReportedProfile);

// ===================== SUBSCRIBERS (super_admin only) =====================
router.get('/subscribers', adminProtect, requireSuperAdmin, getSubscribers);

// ===================== CONTACT US (both roles) =====================
router.get('/contact-us', adminProtect, getAllContactUsForAdmin);

// ===================== ADMIN MANAGEMENT (super_admin only) =====================
router.get('/admins', adminProtect, requireSuperAdmin, listAdmins);
router.post('/admins', adminProtect, requireSuperAdmin, createAdminAccount);
router.put('/admins/:id', adminProtect, requireSuperAdmin, updateAdminAccount);
router.delete('/admins/:id', adminProtect, requireSuperAdmin, deleteAdminAccount);

// ===================== AUDIT LOGS (super_admin only) =====================
router.get('/audit-logs', adminProtect, requireSuperAdmin, getAuditLogs);

module.exports = router;
