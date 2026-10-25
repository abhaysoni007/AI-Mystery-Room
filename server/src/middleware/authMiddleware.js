import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/response.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required',
        statusCode: 401,
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtErr) {
      return sendError(res, {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
        statusCode: 401,
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, {
        code: 'USER_NOT_FOUND',
        message: 'Authenticated user account no longer exists',
        statusCode: 401,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
        }
      } catch (jwtErr) {
        // Silently treat as anonymous if token is invalid or expired
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

