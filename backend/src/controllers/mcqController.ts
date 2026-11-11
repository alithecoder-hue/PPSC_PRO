import { Request, Response } from 'express';
import * as mcqService from '../services/mcqService';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const getMCQs = async (req: Request, res: Response) => {
  try {
    const { categoryId, subCategoryId, topicId, limit } = req.query;
    // Cap the page size so one request cannot dump the whole bank.
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const mcqs = await mcqService.getAllMCQs(
      categoryId ? Number(categoryId) : undefined,
      subCategoryId ? Number(subCategoryId) : undefined,
      topicId ? Number(topicId) : undefined,
      safeLimit
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
    // Explicit contract the classroom expects: { mcqs: [...] }
    res.json({ mcqs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate exam' });
  }
};

export const generateCustomExam = async (req: Request, res: Response) => {
  try {
    const { selections } = req.body;
    if (!selections || !Array.isArray(selections) || selections.length === 0 || selections.length > 16) {
      return res.status(400).json({ error: 'Invalid config' });
    }
    const mcqs = await mcqService.getCustomExamSession(selections);
    // Explicit contract the classroom expects: { mcqs: [...] }
    res.json({ mcqs });
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

    const { score, total, examId, answers } = req.body;

    // The exam must exist when one is named (a bogus id used to 500 on the FK).
    if (examId != null) {
      const exam = await prisma.exam.findUnique({ where: { id: Number(examId) } });
      if (!exam) return res.status(400).json({ error: 'Unknown exam' });
    }

    let finalScore: number;
    let finalTotal: number;

    if (Array.isArray(answers) && answers.length > 0) {
      // Server-side grading: the score is computed here from the answers,
      // never trusted from the client, so XP and the leaderboard cannot
      // be farmed by posting a made-up score.
      const ids = [...new Set(
        answers.map((a: any) => Number(a?.mcqId)).filter((n: number) => Number.isFinite(n))
      )];
      if (ids.length === 0) return res.status(400).json({ error: 'No valid answers' });
      if (ids.length > 500) return res.status(400).json({ error: 'Too many answers' });
      const rows = await prisma.mCQ.findMany({
        where: { id: { in: ids } },
        select: { id: true, correctOption: true },
      });
      const key = new Map(rows.map((r: any) => [r.id, r.correctOption]));
      finalTotal = rows.length;
      finalScore = answers.reduce(
        (acc: number, a: any) => acc + (key.get(Number(a?.mcqId)) === a?.selectedOption ? 1 : 0),
        0
      );
    } else {
      // Legacy client-scored path, kept only so older clients keep working
      // while the new frontend rolls out. Validated, never trusted blindly.
      if (
        typeof score !== 'number' || typeof total !== 'number' ||
        !Number.isFinite(score) || !Number.isFinite(total) ||
        score < 0 || total <= 0 || score > total
      ) {
        return res.status(400).json({ error: 'Invalid score payload' });
      }
      finalScore = Math.floor(score);
      finalTotal = Math.floor(total);
    }

    const result = await prisma.examResult.create({
      data: {
        userId: Number(userId),
        examId: examId != null ? Number(examId) : null,
        score: finalScore,
        total: finalTotal,
      },
    });

    // Keep the user's progress stats in sync
    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        testsTaken: { increment: 1 },
        xp: { increment: finalScore * 10 },
        lastActive: new Date(),
      },
    });

    res.status(201).json({
      message: 'Exam submitted successfully',
      result,
      score: finalScore,
      total: finalTotal,
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
