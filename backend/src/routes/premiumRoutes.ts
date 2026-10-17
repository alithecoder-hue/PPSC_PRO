import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
  getPremiumDashboard,
  getTodos, createTodo, updateTodo, deleteTodo,
  getSavedMCQs, saveMCQ, unsaveMCQ,
  getTrackedJobs, trackJob, untrackJob,
  getPlannerItems, createPlannerItem, updatePlannerItem, deletePlannerItem
} from '../controllers/premiumController';

const router = Router();

// All premium routes require authentication (but NOT necessarily ADMIN)
router.use(authenticateJWT);

// Dashboard
router.get('/me', getPremiumDashboard);

// To-Do
router.get('/todos', getTodos);
router.post('/todos', createTodo);
router.patch('/todos/:id', updateTodo);
router.delete('/todos/:id', deleteTodo);

// Saved MCQs
router.get('/saved-mcqs', getSavedMCQs);
router.post('/saved-mcqs', saveMCQ);
router.delete('/saved-mcqs/:mcqId', unsaveMCQ);

// Job Tracking
router.get('/tracked-jobs', getTrackedJobs);
router.post('/tracked-jobs', trackJob);
router.delete('/tracked-jobs/:jobId', untrackJob);

// Planner
router.get('/planner', getPlannerItems);
router.post('/planner', createPlannerItem);
router.patch('/planner/:id', updatePlannerItem);
router.delete('/planner/:id', deletePlannerItem);

export default router;
