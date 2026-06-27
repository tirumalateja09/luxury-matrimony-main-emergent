const express = require('express');
const router = express.Router();
const { 
    getReceivedRequests, 
    getSentRequests, 
    getAcceptedChats, 
    respondToRequest,
    sendChatRequest 
} = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

// 1. Send a new chat request
router.post('/send', protect, sendChatRequest);

// 2. Tab 3: Received Requests (Pending list for me to Accept/Reject)
router.get('/received', protect, getReceivedRequests);

// 3. Tab 2: Sent Requests (List of requests I sent to others)
router.get('/sent', protect, getSentRequests);

// 4. Tab 1: Accepted Connections (Actual Chat List)
router.get('/accepted', protect, getAcceptedChats);

// 5. Action: Accept or Reject a request
router.put('/respond', protect, respondToRequest);

module.exports = router;