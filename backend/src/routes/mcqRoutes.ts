import { Router } from 'express';
import { createMCQ, getMCQs, generateExam, submitExamResult, generateCustomExam, getCategories, getPublicTopicsByCategory, getPublicSubtopicsByTopic, getPublicSubtopicContent } from '../controllers/mcqController';
import { authenticateJWT, isAdmin, requirePremium } from '../middleware/authMiddleware';

const router = Router();

// Practice list: signed-in members only (audit H2/H3). Practice is free;
// the per-request cap (<=100) in the controller stops the bulk dump of the
// bank, and correctOption is kept because instant feedback needs it.
router.get('/', authenticateJWT, getMCQs);
// Exam generation is the premium surface: premium members pass, free
// members get 5 mock tests per calendar month (requirePremium).
router.get('/exam', authenticateJWT, requirePremium, generateExam);
router.post('/custom-exam', authenticateJWT, requirePremium, generateCustomExam);
router.get('/categories', getCategories);
router.post('/exam/submit', authenticateJWT, submitExamResult);

// Admin routes
router.post('/', authenticateJWT, isAdmin, createMCQ);

// Public content reading routes (subjects / notes are readable without login)
router.get('/topics/category/:categoryId', getPublicTopicsByCategory);
router.get('/subtopics/topic/:subCategoryId', getPublicSubtopicsByTopic);
router.get('/subtopic-content/:topicId', getPublicSubtopicContent);

export default router;
