import { Router } from 'express';
import { verifySubscription } from '../controllers/billingController';

const router = Router();

router.post('/verify', verifySubscription);

export default router;
