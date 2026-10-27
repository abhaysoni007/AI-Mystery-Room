import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import healthRouter from './routes/health.js';

const app = express();

const clientOrigin = env.CLIENT_URL ? env.CLIENT_URL.trim().replace(/\/+$/, '') : null;
const allowedOrigins = Array.from(new Set([
  clientOrigin,
  'https://mysterio.abhaysoni.app',
  'https://mysterio.abhay.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean)));

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.abhaysoni.app') ||
      origin.endsWith('.abhay.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/health', healthRouter);
app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
