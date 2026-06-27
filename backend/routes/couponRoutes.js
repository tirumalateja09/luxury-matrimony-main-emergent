const express = require('express');
const router = express.Router();
const { validateCoupon, redeemCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect } = require('../middlewares/authMiddleware');
const { adminProtect, requireSuperAdmin } = require('../middlewares/authMiddleware');

// User-facing
router.post('/validate', protect, validateCoupon);
router.post('/redeem', protect, redeemCoupon);

// Admin CRUD
router.get('/admin', adminProtect, listCoupons);
router.post('/admin', adminProtect, requireSuperAdmin, createCoupon);
router.put('/admin/:id', adminProtect, requireSuperAdmin, updateCoupon);
router.delete('/admin/:id', adminProtect, requireSuperAdmin, deleteCoupon);

module.exports = router;
