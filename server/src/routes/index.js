import { Router } from 'express';
import healthRouter from './health.js';
import casesRouter from './cases.js';

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use('/cases', casesRouter);

export default apiRouter;
