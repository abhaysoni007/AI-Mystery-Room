import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { sendSuccess, sendError } from '../utils/response.js';

const authRouter = Router();

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Detective ID / Username must be at least 3 characters')
    .max(32, 'Detective ID / Username cannot exceed 32 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Detective ID can only contain letters, numbers, underscores, and hyphens')
    .toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(64).optional(),
});

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Detective ID / Username is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

function serializeUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name || user.username,
    hasCompletedWalkthrough: user.hasCompletedWalkthrough,
    createdAt: user.createdAt,
  };
}

function generateToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), username: user.username },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/v1/auth/signup - Register new user directly with ID & password
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

    const { username, password, name } = validation.data;

    // Check if username is already taken
    const existing = await User.findOne({ username });
    if (existing) {
      return sendError(res, {
        code: 'USERNAME_ALREADY_EXISTS',
        message: 'This Detective ID / Username is already taken',
        statusCode: 409,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      name: name && name.trim().length >= 2 ? name.trim() : username,
      passwordHash,
      hasCompletedWalkthrough: false,
    });

    const token = generateToken(user);

    return sendSuccess(res, {
      data: {
        token,
        user: serializeUser(user),
      },
      message: 'Account registered successfully',
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login - Detective ID (Username) + Password login
authRouter.post('/login', async (req, res, next) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message || 'Detective ID and password are required',
        statusCode: 400,
      });
    }

    const { username, password } = validation.data;

    const user = await User.findOne({ username });
    if (!user) {
      return sendError(res, {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid Detective ID or password',
        statusCode: 401,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return sendError(res, {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid Detective ID or password',
        statusCode: 401,
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
