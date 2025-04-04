// src/api/index.ts
import { Router } from 'express';
import schedulingRouter from './scheduling';

const router = Router();

// Only include the scheduling router which exists
router.use('/scheduling', schedulingRouter);

export default router;