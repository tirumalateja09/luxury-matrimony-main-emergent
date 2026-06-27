const express = require('express');
const router = express.Router();
const { getInterestsByTab, respondToInterest, sendInterest } = require('../controllers/interestController');
const { protect } = require('../middlewares/authMiddleware');
router.get('/my-interests', protect, getInterestsByTab);
router.put('/respond/:interestId', protect, respondToInterest);
router.post('/send', protect, sendInterest); 

module.exports = router;