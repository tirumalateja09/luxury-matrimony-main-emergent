const express = require('express');
const router = express.Router();
const {
    listServices, getService, contactVendor, getCategories,
    adminListServices, adminCreateService, adminUpdateService, adminDeleteService, adminGetInquiries,
} = require('../controllers/weddingServiceController');
const { protect } = require('../middlewares/authMiddleware');
const { adminProtect, requireSuperAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/categories', getCategories);
router.get('/', listServices);
router.get('/:id', getService);
router.post('/:id/contact', protect, contactVendor);

// Admin routes
router.get('/admin/list', adminProtect, adminListServices);
router.post('/admin/create', adminProtect, requireSuperAdmin, adminCreateService);
router.put('/admin/:id', adminProtect, requireSuperAdmin, adminUpdateService);
router.delete('/admin/:id', adminProtect, requireSuperAdmin, adminDeleteService);
router.get('/admin/:id/inquiries', adminProtect, adminGetInquiries);

module.exports = router;
