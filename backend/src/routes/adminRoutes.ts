import { Router } from 'express';
import { 
  getDashboardStats, 
  getUsers, 
  getAcademics, 
  getBusiness, 
  createSubscription,
  deleteSubscription,
  createPromoCode,
  deletePromoCode,
  getContent,
  getSettings,
  updateSettings,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getMedia,
  uploadMedia,
  deleteMedia,
  getCommunications,
  updateCommunicationStatus,
  deleteCommunication,
  createSubject,
  createTopic,
  createMCQ,
  updateSubject,
  deleteSubject,
  updateMCQ,
  deleteMCQ,
  createExam,
  deleteExam,
  createPastPaper,
  deletePastPaper,
  bulkCreateMCQs,
  createAnnouncement,
  deleteAnnouncement,
  createJob,
  deleteJob,
  updateUserRole,
  deleteUser,
  getTopics,
  getTopicsBySubCategory,
  createNewTopic,
  updateTopic,
  deleteTopic,
  getTopicsByCategory,
  createAdminTopic,
  updateAdminTopic,
  deleteAdminTopic,
  getSubtopicsByTopic,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
  getSubtopicContent,
  upsertSubtopicContent,
  bulkUploadTopicsAndSubtopics
} from '../controllers/adminController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
  })
});

const router = Router();

// Every route in this file requires a valid JWT with ADMIN role
router.use(authenticateJWT, isAdmin);

router.get('/media', getMedia);
router.post('/media', upload.single('file'), uploadMedia);
router.delete('/media/:id', deleteMedia);

// --- READ endpoints ---
router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/academics', getAcademics);
router.get('/business', getBusiness);
router.post('/business/subscription', createSubscription);
router.delete('/business/subscription/:id', deleteSubscription);
router.post('/business/promo', createPromoCode);
router.delete('/business/promo/:id', deletePromoCode);
router.get('/settings', getSettings);
router.post('/settings', updateSettings);
router.get('/content', getContent);
router.post('/content/testimonial', createTestimonial);
router.put('/content/testimonial/:id', updateTestimonial);
router.delete('/content/testimonial/:id', deleteTestimonial);
router.post('/content/faq', createFAQ);
router.put('/content/faq/:id', updateFAQ);
router.delete('/content/faq/:id', deleteFAQ);
router.get('/communications', getCommunications);
router.put('/communications/:id/status', updateCommunicationStatus);
router.delete('/communications/:id', deleteCommunication);

// --- Subject CRUD ---
router.post('/academics/subject', createSubject);
router.put('/academics/subject/:id', updateSubject);
router.delete('/academics/subject/:id', deleteSubject);

// --- Topic CRUD ---
router.post('/academics/topic', createTopic);

// --- MCQ CRUD ---
router.post('/academics/pastpaper', createPastPaper);
router.delete('/academics/pastpaper/:id', deletePastPaper);
router.post('/academics/mcq/bulk', upload.single('csv'), bulkCreateMCQs);
router.post('/academics/mcq', createMCQ);
router.put('/academics/mcq/:id', updateMCQ);
router.delete('/academics/mcq/:id', deleteMCQ);

// --- Exam CRUD ---
router.post('/academics/exam', createExam);
router.delete('/academics/exam/:id', deleteExam);

// --- Announcement CRUD ---
router.post('/content/announcement', createAnnouncement);
router.delete('/content/announcement/:id', deleteAnnouncement);

// --- Job CRUD ---
router.post('/content/job', createJob);
router.delete('/content/job/:id', deleteJob);

// --- User Management ---
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// --- Topic (Subtopic) Manager CRUD ---
router.get('/topics', getTopics);
router.get('/topics/sub/:subCategoryId', getTopicsBySubCategory);
router.post('/topics', createNewTopic);
router.put('/topics/:id', updateTopic);
router.delete('/topics/:id', deleteTopic);

// --- Drill-Down Subjects Manager: SubCategory (Topic) CRUD ---
router.get('/drilldown/topics/category/:categoryId', getTopicsByCategory);
router.post('/drilldown/topics', createAdminTopic);
router.post('/drilldown/bulk-upload', bulkUploadTopicsAndSubtopics);
router.put('/drilldown/topics/:id', updateAdminTopic);
router.delete('/drilldown/topics/:id', deleteAdminTopic);

// --- Drill-Down Subjects Manager: Topic (Subtopic) CRUD ---
router.get('/drilldown/subtopics/topic/:subCategoryId', getSubtopicsByTopic);
router.post('/drilldown/subtopics', createSubtopic);
router.put('/drilldown/subtopics/:id', updateSubtopic);
router.delete('/drilldown/subtopics/:id', deleteSubtopic);

// --- Drill-Down Subjects Manager: SubtopicContent ---
router.get('/drilldown/content/:topicId', getSubtopicContent);
router.post('/drilldown/content/:topicId', upsertSubtopicContent);

export default router;

