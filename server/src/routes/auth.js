import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { OtpVerification } from '../models/OtpVerification.js';
import { generateOtpCode, sendOtpEmail } from '../services/emailService.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/response.js';

const authRouter = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(64),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const verifyOtpSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit numeric code'),
  purpose: z.enum(['signup', 'login', 'reset_password']).default('signup'),
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit numeric code'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    hasCompletedWalkthrough: user.hasCompletedWalkthrough,
    createdAt: user.createdAt,
  };
}

function generateToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/v1/auth/signup - Register new user & send OTP
authRouter.post('/signup', async (req, res, next) => {
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Invalid registration details',
        statusCode: 400,
        fields: validation.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = validation.data;

    // Check if an already verified user exists
    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) {
      return sendError(res, {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists',
        statusCode: 409,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existing) {
      existing.name = name;
      existing.passwordHash = passwordHash;
      await existing.save();
    } else {
      await User.create({
        name,
        email,
        passwordHash,
        isVerified: false,
      });
    }

    // Generate and store OTP
    const rawOtp = generateOtpCode();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpVerification.deleteMany({ email, purpose: 'signup' });
    await OtpVerification.create({
      email,
      otpHash,
      purpose: 'signup',
      expiresAt,
      attempts: 0,
    });

    await sendOtpEmail({ email, otp: rawOtp, purpose: 'signup' });

    const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER);
    const devOtp = (!hasSmtp && env.NODE_ENV !== 'production') ? rawOtp : undefined;

    return sendSuccess(res, {
      data: { email, name, ...(devOtp ? { devOtp } : {}) },
      message: hasSmtp
        ? 'Verification code sent to your email address'
        : `[Dev Mode] Verification code: ${rawOtp} (also logged in server terminal)`,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/verify-otp - Verify 6-digit code and issue JWT
authRouter.post('/verify-otp', async (req, res, next) => {
  try {
    const validation = verifyOtpSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Invalid OTP payload',
        statusCode: 400,
      });
    }

    const { email, otp, purpose } = validation.data;

    const record = await OtpVerification.findOne({ email, purpose });
    if (!record || record.expiresAt < new Date()) {
      return sendError(res, {
        code: 'OTP_EXPIRED_OR_INVALID',
        message: 'Verification code has expired or does not exist. Please request a new code.',
        statusCode: 400,
      });
    }

    if (record.attempts >= 5) {
      await OtpVerification.deleteOne({ _id: record._id });
      return sendError(res, {
        code: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Too many incorrect attempts. Please request a fresh verification code.',
        statusCode: 429,
      });
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return sendError(res, {
        code: 'INVALID_OTP',
        message: 'Incorrect verification code. Please check your email and try again.',
        statusCode: 400,
      });
    }

    // OTP is valid
    await OtpVerification.deleteOne({ _id: record._id });

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, {
        code: 'USER_NOT_FOUND',
        message: 'Associated user account was not found.',
        statusCode: 404,
      });
    }

    if (purpose === 'signup') {
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user);

    return sendSuccess(res, {
      data: {
        token,
        user: serializeUser(user),
      },
      message: 'Verification successful',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login - Email + Password login
authRouter.post('/login', async (req, res, next) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Email and password are required',
        statusCode: 400,
      });
    }

    const { email, password } = validation.data;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        statusCode: 401,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return sendError(res, {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        statusCode: 401,
      });
    }

    if (!user.isVerified) {
      // Re-dispatch signup verification code
      const rawOtp = generateOtpCode();
      const otpHash = await bcrypt.hash(rawOtp, 10);
      await OtpVerification.deleteMany({ email, purpose: 'signup' });
      await OtpVerification.create({
        email,
        otpHash,
        purpose: 'signup',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      await sendOtpEmail({ email, otp: rawOtp, purpose: 'signup' });

      const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER);
      const devNotice = !hasSmtp && env.NODE_ENV !== 'production' ? ` [Dev Simulator Code: ${rawOtp}]` : '';

      return sendError(res, {
        code: 'ACCOUNT_NOT_VERIFIED',
        message: `Your account is not yet verified. A fresh OTP code has been dispatched.${devNotice}`,
        statusCode: 403,
      });
    }

    const token = generateToken(user);

    return sendSuccess(res, {
      data: {
        token,
        user: serializeUser(user),
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/forgot-password - Dispatches password reset code
authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, {
        code: 'VALIDATION_ERROR',
        message: 'Valid email address required',
        statusCode: 400,
      });
    }

    const { email } = validation.data;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (user && user.isVerified) {
      const rawOtp = generateOtpCode();
      const otpHash = await bcrypt.hash(rawOtp, 10);
      await OtpVerification.deleteMany({ email, purpose: 'reset_password' });
      await OtpVerification.create({
        email,
        otpHash,
        purpose: 'reset_password',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      await sendOtpEmail({ email, otp: rawOtp, purpose: 'reset_password' });

      const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER);
      const devOtp = (!hasSmtp && env.NODE_ENV !== 'production') ? rawOtp : undefined;

      return sendSuccess(res, {
        data: { email, ...(devOtp ? { devOtp } : {}) },
        message: hasSmtp
          ? 'If an account exists with this email, a reset code has been sent.'
          : `[Dev Mode] Reset code: ${rawOtp} (also logged in server terminal)`,
      });
    }

    return sendSuccess(res, {
      data: { email },
      message: 'If an account exists with this email, a reset code has been sent.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/reset-password - Verifies code and resets password
authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Invalid password reset details',
        statusCode: 400,
      });
    }

    const { email, otp, newPassword } = validation.data;

    const record = await OtpVerification.findOne({ email, purpose: 'reset_password' });
    if (!record || record.expiresAt < new Date()) {
      return sendError(res, {
        code: 'OTP_EXPIRED_OR_INVALID',
        message: 'Password reset code has expired. Please request a new one.',
        statusCode: 400,
      });
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return sendError(res, {
        code: 'INVALID_OTP',
        message: 'Incorrect verification code.',
        statusCode: 400,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, {
        code: 'USER_NOT_FOUND',
        message: 'User account not found',
        statusCode: 404,
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await OtpVerification.deleteOne({ _id: record._id });

    const token = generateToken(user);

    return sendSuccess(res, {
      data: {
        token,
        user: serializeUser(user),
      },
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/me - Authenticated user profile
authRouter.get('/me', requireAuth, async (req, res) => {
  return sendSuccess(res, {
    data: {
      user: serializeUser(req.user),
    },
  });
});

// PATCH /api/v1/auth/walkthrough - Update walkthrough completion
authRouter.patch('/walkthrough', requireAuth, async (req, res, next) => {
  try {
    const hasCompletedWalkthrough = req.body.hasCompletedWalkthrough !== false;
    req.user.hasCompletedWalkthrough = hasCompletedWalkthrough;
    await req.user.save();

    return sendSuccess(res, {
      data: {
        user: serializeUser(req.user),
      },
      message: 'Walkthrough status updated',
    });
  } catch (error) {
    next(error);
  }
});

export default authRouter;
