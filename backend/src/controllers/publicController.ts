import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitContactMessage = async (req: Request, res: Response) => {
  try {
    const { senderName, email, subject, message } = req.body;
    if (!senderName || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    const msg = await prisma.contactMessage.create({
      data: { senderName, email, subject: subject || 'General Enquiry', message }
    });
    res.status(201).json({ success: true, id: msg.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

export const getFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        xp: true,
        role: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

export const getPastPapers = async (req: Request, res: Response) => {
  try {
    const papers = await prisma.pastPaper.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch past papers' });
  }
};

export const getDailyTest = async (req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const test = await prisma.dailyTest.findFirst({
      where: { date: { gte: todayStart } },
      orderBy: { date: 'asc' }
    });

    if (test && test.mcqIds.length > 0) {
      const mcqs = await prisma.mCQ.findMany({
        where: { id: { in: test.mcqIds } }
      });
      return res.json({ mcqs });
    }

    // Fallback: 50 random MCQs
    const totalCount = await prisma.mCQ.count();
    const take = Math.min(50, totalCount);
    
    // In postgres, fetching random requires raw query or skipping. 
    // For simplicity, we just fetch newest 50. In prod, use random offset.
    const mcqs = await prisma.mCQ.findMany({ take, orderBy: { createdAt: 'desc' } });
    res.json({ mcqs });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily test' });
  }
};
