import { Router } from 'express';
import { getJobs, getAnnouncements, getTestimonials, getFAQs, getLeaderboard, getPastPapers, getDailyTest, submitContactMessage } from '../controllers/publicController';

const router = Router();

router.get('/jobs', getJobs);
router.get('/announcements', getAnnouncements);
router.get('/testimonials', getTestimonials);
router.get('/faqs', getFAQs);
router.get('/leaderboard', getLeaderboard);
router.get('/past-papers', getPastPapers);
router.get('/daily-test', getDailyTest);
router.post('/contact', submitContactMessage);

export default router;
