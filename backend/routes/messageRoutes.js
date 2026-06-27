const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

// for send Message 
router.post('/send', protect, sendMessage);

//specific chat  history 
router.get('/:conversationId', protect, getMessages);

module.exports = router;