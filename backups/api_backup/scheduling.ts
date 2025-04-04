// src/api/scheduling.ts
// NOTE: This file is deprecated and will be removed in a future update.
// New API routes should use Next.js API routes in src/pages/api/ or src/app/api/
import { Router } from 'express';

// Dummy implementation to prevent build errors
const router = Router();

/**
 * This route is deprecated. Use Next.js API routes instead.
 */
router.post('/schedule', (req, res) => {
  res.status(410).json({ error: 'This API endpoint is deprecated. Please use the Next.js API route instead.' });
});

/**
 * This route is deprecated. Use Next.js API routes instead.
 */
router.get('/blocks', (req, res) => {
  res.status(410).json({ error: 'This API endpoint is deprecated. Please use the Next.js API route instead.' });
});

/**
 * This route is deprecated. Use Next.js API routes instead.
 */
router.get('/stats', (req, res) => {
  res.status(410).json({ error: 'This API endpoint is deprecated. Please use the Next.js API route instead.' });
});

export default router;