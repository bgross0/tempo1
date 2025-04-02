// src/api/index.ts
import { Router } from 'express';
import taskRouter from './tasks';
import projectRouter from './projects';
import userRouter from './users';
import schedulingRouter from './scheduling';

const router = Router();

router.use('/tasks', taskRouter);
router.use('/projects', projectRouter);
router.use('/users', userRouter);
router.use('/scheduling', schedulingRouter); // Add the scheduling router

export default router;