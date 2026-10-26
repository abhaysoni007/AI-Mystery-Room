import { Router } from 'express';
import { sendSuccess } from '../utils/response.js';
import { isDbConnected } from '../config/db.js';

const router = Router();

router.get(['/', '/health'], (req, res) => {
  return sendSuccess(res, {
    data: {
      status: 'healthy',
      database: isDbConnected() ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    message: 'AI Mystery Room API is running',
  });
});

export default router;
