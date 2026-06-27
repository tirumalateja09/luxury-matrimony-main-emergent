const express = require('express');
const router = express.Router();
const { getMyReferralCode, validateReferralCode, applyReferralCode, adminListReferrals } = require('../controllers/referralController');
const { protect } = require('../middlewares/authMiddleware');
const { adminProtect } = require('../middlewares/authMiddleware');

router.get('/my-code', protect, getMyReferralCode);
router.post('/validate', validateReferralCode);
router.post('/apply', protect, applyReferralCode);
router.get('/admin', adminProtect, adminListReferrals);

module.exports = router;
