const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @desc    Admin Registration
// @route   POST /api/admin/register
exports.adminRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }

        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: "Admin already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.create({ name, email, password: hashedPassword });

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Admin Login
// @route   POST /api/admin/login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
        }

        // 2. Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
        }

        // 3. Generate Token with actual Admin Role
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check Admin JWT token status (valid/expired) + role
// @route   GET /api/admin/token-status
// @access  Public (requires token in Authorization header)
exports.checkAdminTokenStatus = async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (!token) {
            return res.status(400).json({
                success: false,
                valid: false,
                expired: false,
                message: "Authorization token is required"
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!['admin', 'super_admin'].includes(decoded.role)) {
                return res.status(200).json({
                    success: true,
                    valid: false,
                    expired: false,
                    message: "Token is not an admin token"
                });
            }

            const admin = await Admin.findById(decoded.id).select('_id role name');
            if (!admin) {
                return res.status(200).json({
                    success: true,
                    valid: false,
                    expired: false,
                    message: "Admin account no longer exists"
                });
            }

            return res.status(200).json({
                success: true,
                valid: true,
                expired: false,
                adminId: admin._id,
                adminName: admin.name || '',
                role: admin.role || 'admin',
                expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : null
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(200).json({
                    success: true,
                    valid: false,
                    expired: true,
                    role: 'admin',
                    message: "Token expired",
                    expiredAt: error.expiredAt || null
                });
            }

            return res.status(200).json({
                success: true,
                valid: false,
                expired: false,
                message: "Invalid token"
            });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
