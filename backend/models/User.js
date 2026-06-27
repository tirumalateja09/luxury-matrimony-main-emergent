const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Removed 'required: true' to allow either field to be empty
  email: { 
    type: String, 
    unique: true, 
    sparse: true, // Crucial: Allows multiple null values without index errors
    lowercase: true, 
    trim: true 
  },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true, // Allows null if the user only registers with email
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  fullName: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
    trim: true,
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  password: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  lastOtpSentAt: { type: Date },
  pendingPhone: {
    type: String,
    trim: true,
  },
  pendingPhoneOtp: { type: String },
  pendingPhoneOtpExpires: { type: Date },
  pendingPhoneLastOtpSentAt: { type: Date },
  pendingEmail: {
    type: String,
    lowercase: true,
    trim: true,
  },
  pendingEmailOtp: { type: String },
  pendingEmailOtpExpires: { type: Date },
  pendingEmailLastOtpSentAt: { type: Date },
accountStatus: { 
  type: String, 
  enum: ['pending', 'active', 'suspended', 'deleted'], 
  default: 'pending' // Account starts as pending
},
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Validation: Ensure at least one contact method is provided before saving
userSchema.pre('save', function(next) {
    if (!this.email && !this.phone) {
        return next(new Error('At least one contact method (email or phone) is required.'));
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
