import { Router } from 'express';
import healthRouter from './health.js';
import casesRouter from './cases.js';
import authRouter from './auth.js';

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/cases', casesRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;
