import { Request, Response } from 'express';
import * as mcqService from '../services/mcqService';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const getMCQs = async (req: Request, res: Response) => {
  try {
    const { categoryId, subCategoryId, topicId, limit } = req.query;
    const mcqs = await mcqService.getAllMCQs(
      categoryId ? Number(categoryId) : undefined,
      subCategoryId ? Number(subCategoryId) : undefined,
      topicId ? Number(topicId) : undefined,
      limit ? Number(limit) : 50
    );
    res.json(mcqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch MCQs' });
  }
};

export const createMCQ = async (req: Request, res: Response) => {
  try {
    const mcq = await mcqService.createMCQ(req.body);
    res.status(201).json(mcq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create MCQ' });
  }
};

export const generateExam = async (req: Request, res: Response) => {
  try {
    const mcqs = await mcqService.getExamSession(100);
    res.json(mcqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate exam' });
  }
};

export const generateCustomExam = async (req: Request, res: Response) => {
  try {
    const { selections } = req.body;
    if (!selections || !Array.isArray(selections)) {
      return res.status(400).json({ error: 'Invalid config' });
    }
    const mcqs = await mcqService.getCustomExamSession(selections);
    res.json(mcqs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate custom exam' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          include: {
            topics: true,
            _count: { select: { mcqs: true } }
          }
        },
        _count: {
          select: { subCategories: true, mcqs: true }
        }
      }
    });

    const formattedCategories = categories.map((cat: any) => ({
      ...cat,
      subtopics: cat.subCategories.length > 0 ? cat.subCategories.map((sub: any) => ({
        id: sub.id.toString(),
        title: sub.name,
        level: sub.topics.length > 0 ? sub.topics[0].level : 'beginner',
        content: sub.topics.length > 0 
          ? `Covers topics like: ${sub.topics.slice(0, 4).map((t: any) => t.name).join(', ')}${sub.topics.length > 4 ? '...' : ''}`
          : 'Detailed notes and MCQs for this topic area.',
        mcqs: sub._count.mcqs,
        nestedTopics: sub.topics
      })) : undefined
    }));

    res.json(formattedCategories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const submitExamResult = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Contract used by the frontend clients: { score, total, examId? }
    // (examId is null for ad-hoc practice sessions)
    const { score, total, examId } = req.body;
    if (
      typeof score !== 'number' || typeof total !== 'number' ||
      !Number.isFinite(score) || !Number.isFinite(total) ||
      score < 0 || total <= 0 || score > total
    ) {
      return res.status(400).json({ error: 'Invalid score payload' });
    }

    const result = await prisma.examResult.create({
      data: {
        userId: Number(userId),
        examId: examId != null ? Number(examId) : null,
        score: Math.floor(score),
        total: Math.floor(total),
      },
    });

    // Keep the user's progress stats in sync
    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        testsTaken: { increment: 1 },
        xp: { increment: Math.floor(score) * 10 },
        lastActive: new Date(),
      },
    });

    res.status(201).json({
      message: 'Exam submitted successfully',
      result,
    });
  } catch (error) {
    console.error('Submit Exam Error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
};

// ============================================
// PUBLIC CONTENT READING ROUTES
// ============================================

export const getPublicTopicsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const topics = await prisma.subCategory.findMany({
      where: { categoryId: parseInt(categoryId) },
      include: { 
        topics: {
          orderBy: [{ level: 'asc' }, { id: 'asc' }]
        }
      },
      orderBy: { id: 'asc' }
    });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

export const getPublicSubtopicsByTopic = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.params;
    const subtopics = await prisma.topic.findMany({
      where: { subCategoryId: parseInt(subCategoryId) },
      include: { content: { select: { id: true } } },
      orderBy: [{ level: 'asc' }, { id: 'asc' }]
    });
    const result = subtopics.map((s: any) => ({ ...s, hasContent: !!s.content }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subtopics' });
  }
};

export const getPublicSubtopicContent = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const content = await prisma.subtopicContent.findUnique({
      where: { topicId: parseInt(topicId) },
      include: { topic: { select: { id: true, name: true, level: true } } }
    });
    res.json(content || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};
