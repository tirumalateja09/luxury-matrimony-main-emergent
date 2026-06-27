const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);