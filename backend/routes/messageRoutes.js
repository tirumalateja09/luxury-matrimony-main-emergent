const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, reportAbuse } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/send', protect, sendMessage);
router.post('/report', protect, reportAbuse);
router.get('/:conversationId', protect, getMessages);

module.exports = router;
