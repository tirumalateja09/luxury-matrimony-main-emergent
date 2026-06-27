const express = require('express');
const router = express.Router();
const { sendContactRequest, respondToContactRequest, checkContactStatus, getReceivedContactRequests, submitContactUs } = require('../controllers/contactController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/contact-us', submitContactUs);
router.post('/request', protect, sendContactRequest);
router.put('/respond/:requestId', protect, respondToContactRequest);
router.get('/received', protect, getReceivedContactRequests);

router.get('/check-status/:otherUserId', protect, checkContactStatus);
module.exports = router;
