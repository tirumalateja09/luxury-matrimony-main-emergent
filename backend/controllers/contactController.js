const ContactRequest = require('../models/ContactRequest');
const Profile = require('../models/Profile');
const User = require('../models/User');
const ContactUs = require('../models/ContactUs');

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// @desc    Public Contact Us submission
// @route   POST /api/contact/contact-us
// @access  Public
exports.submitContactUs = async (req, res) => {
    try {
        const fullName = toTrimmedString(req.body.fullName);
        const phoneNumber = toTrimmedString(req.body.phoneNumber);
        const emailAddress = toTrimmedString(req.body.emailAddress).toLowerCase();
        const queryType = toTrimmedString(req.body.queryType);
        const message = toTrimmedString(req.body.message);

        if (!fullName || !phoneNumber || !emailAddress || !queryType || !message) {
            return res.status(400).json({
                success: false,
                message: 'fullName, phoneNumber, emailAddress, queryType and message are required'
            });
        }

        if (!isValidEmail(emailAddress)) {
            return res.status(400).json({ success: false, message: 'Invalid emailAddress format' });
        }

        const data = await ContactUs.create({
            fullName,
            phoneNumber,
            emailAddress,
            queryType,
            message
        });

        return res.status(201).json({
            success: true,
            message: 'Your query has been submitted successfully',
            data
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Admin gets all Contact Us submissions with pagination
// @route   GET /api/admin/contact-us
// @access  Private (Admin Only)
exports.getAllContactUsForAdmin = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            ContactUs.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ContactUs.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            count: items.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: items
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.sendContactRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        // 1. SELF-REQUEST CHECK (Ye naya logic add karein)
        if (senderId === receiverId) {
            return res.status(400).json({ 
                success: false, 
                message: "You cannot send a contact request to yourself." 
            });
        }

        // 2. Check if sender is Premium
        const senderProfile = await Profile.findOne({ userId: senderId });
        if (!senderProfile || senderProfile.membershipType === 'Free') {
            return res.status(403).json({ 
                success: false, 
                message: "Please upgrade to Gold or Premium to request contact details." 
            });
        }

        // 3. Check if request already exists
        const existingRequest = await ContactRequest.findOne({ senderId, receiverId });
        if (existingRequest) {
            return res.status(400).json({ success: false, message: "Request already sent." });
        }

        // 4. Create Request
        await ContactRequest.create({ senderId, receiverId });

        res.status(201).json({ success: true, message: "Contact request sent successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.respondToContactRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, manualNumber } = req.body; 
        const userId = req.user.id;

        const request = await ContactRequest.findById(requestId);

        if (!request || request.receiverId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized or Request not found." });
        }

        request.status = action;
        
        if (action === 'accepted') {
            if (manualNumber) {
                // Save the manual number directly to the request
                request.sharedNumber = manualNumber;
            } else {
                // Fallback: Get the registered number and save it permanently to the request
                const user = await User.findById(userId).select('phone');
                request.sharedNumber = user.phone;
            }
        }
        
        // Now sharedNumber will be persisted in MongoDB
        await request.save();

        res.status(200).json({
            success: true,
            message: `Request ${action} successfully.`,
            sharedContact: request.sharedNumber 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// @desc    Get all contact requests received by the user
// @route   GET /api/contact/received
exports.getReceivedContactRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await ContactRequest.find({ 
            receiverId: userId, 
            status: 'pending' 
        }).populate('senderId', 'email phone');

        const enriched = await Promise.all(
            requests.map(async (request) => {
                const senderProfile = await Profile.findOne({ userId: request.senderId._id })
                    .select('fullName profilePhotos city dob');

                return {
                    ...request.toObject(),
                    senderProfile
                };
            })
        );

        res.status(200).json({
            success: true,
            count: enriched.length,
            data: enriched
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// controllers/contactController.js

exports.checkContactStatus = async (req, res) => {
    try {
        const myId = req.user.id;
        const otherUserId = req.params.otherUserId;

        const request = await ContactRequest.findOne({
            $or: [
                { senderId: myId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: myId }
            ]
        });

        if (!request) {
            return res.status(200).json({ 
                success: true, 
                status: 'none', 
                message: "No request found" 
            });
        }

     
        // request 'accepted'
        const numberToShow = request.status === 'accepted' ? request.sharedNumber : null;
        res.status(200).json({
            success: true,
            status: request.status, 
            requestId: request._id,
            amITheReceiver: request.receiverId.toString() === myId,
            sharedNumber: numberToShow 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
