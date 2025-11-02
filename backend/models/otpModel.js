const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    index: { expireAfterSeconds: 0 }, // MongoDB TTL index
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for email and expiresAt
otpSchema.index({ email: 1, expiresAt: 1 });

const otpModel = mongoose.model('OTP', otpSchema);

module.exports = otpModel;

