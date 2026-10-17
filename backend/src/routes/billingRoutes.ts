import { Router } from 'express';
import { verifySubscription } from '../controllers/billingController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Requires a logged-in user; the userId is taken from the JWT, never the body.
router.post('/verify', authenticateJWT, verifySubscription);

export default router;
