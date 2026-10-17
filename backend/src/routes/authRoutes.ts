import { Router } from 'express';
import { register, login, getProfile, updateSubjects, updateDailyGoal } from '../controllers/authController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getProfile);
router.put('/me/subjects', authenticateJWT, updateSubjects);
router.put('/me/goal', authenticateJWT, updateDailyGoal);

export default router;
