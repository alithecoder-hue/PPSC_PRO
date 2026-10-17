import { Router } from 'express';
import { createMCQ, getMCQs, generateExam, submitExamResult, generateCustomExam, getCategories, getPublicTopicsByCategory, getPublicSubtopicsByTopic, getPublicSubtopicContent } from '../controllers/mcqController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public routes (or authenticated for users)
router.get('/', getMCQs);
router.get('/exam', generateExam);
router.post('/custom-exam', generateCustomExam);
router.get('/categories', getCategories);
router.post('/exam/submit', submitExamResult);

// Admin routes
router.post('/', authenticateJWT, isAdmin, createMCQ);

// Public content reading routes
router.get('/topics/category/:categoryId', getPublicTopicsByCategory);
router.get('/subtopics/topic/:subCategoryId', getPublicSubtopicsByTopic);
router.get('/subtopic-content/:topicId', getPublicSubtopicContent);

export default router;
