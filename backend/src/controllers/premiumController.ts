import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/premium/me - Full dashboard data for logged-in premium user
export const getPremiumDashboard = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true,
        xp: true, streak: true, testsTaken: true, hoursStudied: true,
        createdAt: true, lastActive: true, dailyGoalTarget: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [savedMcqCount, todoCount, pendingTodoCount, trackedJobs] = await Promise.all([
      prisma.savedMCQ.count({ where: { userId } }),
      prisma.todoItem.count({ where: { userId } }),
      prisma.todoItem.count({ where: { userId, completed: false } }),
      prisma.userJobTracking.findMany({
        where: { userId },
        include: { job: { select: { id: true, title: true, organization: true, deadline: true } } },
        orderBy: { trackedAt: 'desc' },
        take: 3
      })
    ]);

    // Weekly MCQ target progress (simplified — track MCQs done today)
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    res.json({
      user,
      stats: { savedMcqs: savedMcqCount, totalTodos: todoCount, pendingTodos: pendingTodoCount },
      trackedJobs: trackedJobs.map((t: any) => t.job),
      dailyGoal: { target: user.dailyGoalTarget || 20, completed: 0 } // Can be expanded with session tracking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// --- TO-DO ---
export const getTodos = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const todos = await prisma.todoItem.findMany({
      where: { userId },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }]
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

export const createTodo = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { title, description, dueDate, priority } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    const todo = await prisma.todoItem.create({
      data: { userId, title: title.trim(), description: description?.trim() || null, dueDate: dueDate ? new Date(dueDate) : null, priority: priority || 'Medium' }
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { id } = req.params;
    const { title, description, dueDate, priority, completed } = req.body;
    const todo = await prisma.todoItem.updateMany({
      where: { id: parseInt(id), userId },
      data: { title, description, dueDate: dueDate ? new Date(dueDate) : undefined, priority, completed }
    });
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { id } = req.params;
    await prisma.todoItem.deleteMany({ where: { id: parseInt(id), userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};

// --- SAVED MCQs ---
export const getSavedMCQs = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const saved = await prisma.savedMCQ.findMany({
      where: { userId },
      include: {
        mcq: {
          include: { category: { select: { name: true } } }
        }
      },
      orderBy: { savedAt: 'desc' }
    });
    res.json(saved.map((s: any) => ({ ...s.mcq, savedAt: s.savedAt, savedId: s.id })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved MCQs' });
  }
};

export const saveMCQ = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { mcqId } = req.body;
    const saved = await prisma.savedMCQ.upsert({
      where: { userId_mcqId: { userId, mcqId: parseInt(mcqId) } },
      create: { userId, mcqId: parseInt(mcqId) },
      update: {}
    });
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save MCQ' });
  }
};

export const unsaveMCQ = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { mcqId } = req.params;
    await prisma.savedMCQ.deleteMany({ where: { userId, mcqId: parseInt(mcqId) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsave MCQ' });
  }
};

// --- JOB TRACKING ---
export const getTrackedJobs = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const tracked = await prisma.userJobTracking.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { trackedAt: 'desc' }
    });
    res.json(tracked.map((t: any) => ({ ...t.job, trackedAt: t.trackedAt, trackingId: t.id, notes: t.notes })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracked jobs' });
  }
};

export const trackJob = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { jobId, notes } = req.body;
    const tracked = await prisma.userJobTracking.upsert({
      where: { userId_jobId: { userId, jobId: parseInt(jobId) } },
      create: { userId, jobId: parseInt(jobId), notes: notes || '' },
      update: { notes: notes || '' }
    });
    res.status(201).json(tracked);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track job' });
  }
};

export const untrackJob = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { jobId } = req.params;
    await prisma.userJobTracking.deleteMany({ where: { userId, jobId: parseInt(jobId) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to untrack job' });
  }
};

// --- PLANNER ---
export const getPlannerItems = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const items = await prisma.plannerItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch planner items' });
  }
};

export const createPlannerItem = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { day, title } = req.body;
    if (!title?.trim() || !day?.trim()) return res.status(400).json({ error: 'Title and day are required' });
    const item = await prisma.plannerItem.create({
      data: { userId, day: day.trim(), title: title.trim() }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create planner item' });
  }
};

export const updatePlannerItem = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { id } = req.params;
    const { title, completed } = req.body;
    const item = await prisma.plannerItem.updateMany({
      where: { id: parseInt(id), userId },
      data: { title, completed }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update planner item' });
  }
};

export const deletePlannerItem = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.userId);
    const { id } = req.params;
    await prisma.plannerItem.deleteMany({ where: { id: parseInt(id), userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete planner item' });
  }
};
