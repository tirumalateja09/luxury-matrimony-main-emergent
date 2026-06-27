const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: "No token, authorization denied" });
    }
};

// Middleware to allow only admins
exports.adminProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // 1. Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 2. Strict Role Check
            if (decoded.role !== 'admin') {
                return res.status(403).json({ success: false, message: "Access denied. Not an Admin." });
            }

            // 3. Find Admin in DB
            req.user = await Admin.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Admin account no longer exists." });
            }

            next();
        } catch (error) {
            res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: "No token, Admin access denied" });
    }
};