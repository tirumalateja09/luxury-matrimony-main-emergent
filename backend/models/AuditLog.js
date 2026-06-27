const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    adminEmail: { type: String, default: '' },
    adminRole:  { type: String, default: '' },
    action:     { type: String, required: true },          // e.g. 'verify_profile', 'update_account_status'
    targetType: { type: String, default: '' },             // e.g. 'Profile', 'User'
    targetId:   { type: String, default: '' },
    targetName: { type: String, default: '' },
    changedFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    previousValues: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    newValues:      { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress:  { type: String, default: '' },
    notes:      { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
