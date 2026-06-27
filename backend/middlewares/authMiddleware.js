const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const ADMIN_ROLES = ['admin', 'super_admin'];

// ===================== USER PROTECT =====================
exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
};

// ===================== ADMIN PROTECT (both roles) =====================
exports.adminProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!ADMIN_ROLES.includes(decoded.role)) {
                return res.status(403).json({ success: false, message: 'Access denied. Not an Admin.' });
            }

            const admin = await Admin.findById(decoded.id).select('-password');
            if (!admin) {
                return res.status(401).json({ success: false, message: 'Admin account no longer exists.' });
            }

            req.user = admin;
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, Admin access denied' });
    }
};

// ===================== REQUIRE SUPER ADMIN =====================
exports.requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin privileges required.',
            requiredRole: 'super_admin',
            yourRole: req.user?.role || 'unknown'
        });
    }
    next();
};

// ===================== REQUIRE ROLE (flexible) =====================
exports.requireRole = (roles) => (req, res, next) => {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!req.user || !allowed.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `Access denied. Required role: ${allowed.join(' or ')}.`,
            requiredRoles: allowed,
            yourRole: req.user?.role || 'unknown'
        });
    }
    next();
};
