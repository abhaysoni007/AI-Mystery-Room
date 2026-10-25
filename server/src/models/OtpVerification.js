import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'reset_password'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '10m' },
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

otpVerificationSchema.index({ email: 1, purpose: 1 });

export const OtpVerification =
  mongoose.models.OtpVerification || mongoose.model('OtpVerification', otpVerificationSchema);
