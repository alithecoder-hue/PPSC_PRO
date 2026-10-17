import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const premiumUsers = await prisma.subscription.count({ where: { isActive: true } });
    const totalMCQs = await prisma.mCQ.count();
    const activeTests = await prisma.exam.count();
    const jobsPosted = await prisma.job.count();
    const announcements = await prisma.announcement.count();
    const recentActivity = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ totalUsers, premiumUsers, totalMCQs, activeTests, jobsPosted, announcements, recentActivity });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// --- ACADEMICS ---
export const getAcademics = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const subjects = await prisma.category.findMany({
      include: { 
        subCategories: true,
        _count: { select: { mcqs: true, subCategories: true } } 
      }
    });
    const totalMcqs = await prisma.mCQ.count();
    const mcqs = await prisma.mCQ.findMany({ 
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } } }
    });
    const pastPapers = await prisma.pastPaper.findMany({ orderBy: { createdAt: 'desc' } });
    
    res.json({ subjects, mcqs, pastPapers, totalMcqs, page, limit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch academics data' });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const subject = await prisma.category.create({
      data: { name, description }
    });
    res.status(201).json(subject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

export const createTopic = async (req: Request, res: Response) => {
  try {
    const { name, categoryId } = req.body;
    const topic = await prisma.subCategory.create({
      data: { name, categoryId: parseInt(categoryId) }
    });
    res.status(201).json(topic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
};

export const createMCQ = async (req: Request, res: Response) => {
  try {
    const { question, optionA, optionB, optionC, optionD, correctOption, difficulty, categoryId, subCategoryId } = req.body;
    const mcq = await prisma.mCQ.create({
      data: {
        question, optionA, optionB, optionC, optionD, correctOption,
        difficulty: difficulty || 'Medium',
        categoryId: parseInt(categoryId),
        ...(subCategoryId && { subCategoryId: parseInt(subCategoryId) })
      }
    });
    res.status(201).json(mcq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create MCQ' });
  }
};

export const bulkCreateMCQs = async (req: Request, res: Response) => {
  try {
    const { mcqs } = req.body;
    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({ error: 'mcqs array is required and must not be empty' });
    }

    // Build a subject name → ID map (case-insensitive)
    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    const categoryMap = new Map<string, number>();
    categories.forEach((c: { id: number; name: string }) => categoryMap.set(c.name.toLowerCase().trim(), c.id));

    const toInsert: any[] = [];
    const skipped: { row: number; reason: string }[] = [];

    mcqs.forEach((row: any, index: number) => {
      const rowNum = index + 2; // +2 because row 1 is header
      const q = row.question?.trim();
      const a = row.optionA?.trim() || row.option_a?.trim();
      const b = row.optionB?.trim() || row.option_b?.trim();
      const c = row.optionC?.trim() || row.option_c?.trim();
      const d = row.optionD?.trim() || row.option_d?.trim();
      const ans = (row.correctOption || row.correct_answer || row.answer)?.trim()?.toUpperCase();
      const subjectName = (row.subject || row.category)?.trim();
      const difficulty = row.difficulty?.trim() || 'Medium';
      const explanation = row.explanation?.trim() || null;

      if (!q || !a || !b || !c || !d || !ans) {
        skipped.push({ row: rowNum, reason: 'Missing required field (question, options, or answer)' });
        return;
      }
      if (!['A', 'B', 'C', 'D'].includes(ans)) {
        skipped.push({ row: rowNum, reason: `Invalid answer "${ans}" — must be A, B, C, or D` });
        return;
      }
      if (!subjectName) {
        skipped.push({ row: rowNum, reason: 'Missing subject name' });
        return;
      }

      const categoryId = categoryMap.get(subjectName.toLowerCase());
      if (!categoryId) {
        skipped.push({ row: rowNum, reason: `Subject "${subjectName}" not found in database. Create it first.` });
        return;
      }

      toInsert.push({ question: q, optionA: a, optionB: b, optionC: c, optionD: d, correctOption: ans, difficulty, categoryId, explanation });
    });

    let inserted = 0;
    if (toInsert.length > 0) {
      const result = await prisma.mCQ.createMany({ data: toInsert, skipDuplicates: true });
      inserted = result.count;
      await prisma.activityLog.create({ data: { action: 'Bulk Import', entity: `${inserted} MCQs imported` } });
    }

    res.json({
      success: true,
      imported: inserted,
      skipped: skipped.length,
      skippedDetails: skipped,
      message: `Successfully imported ${inserted} MCQ${inserted !== 1 ? 's' : ''}. ${skipped.length} row${skipped.length !== 1 ? 's' : ''} skipped.`
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Bulk import failed' });
  }
};


export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const subject = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, description }
    });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const catId = parseInt(id);
    await prisma.mCQ.deleteMany({ where: { categoryId: catId } });
    await prisma.category.delete({ where: { id: catId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject. Ensure it has no linked topics or MCQs.' });
  }
};

export const updateMCQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, optionA, optionB, optionC, optionD, correctOption, difficulty, categoryId, subCategoryId } = req.body;
    
    const dataToUpdate: any = {
      ...(question && { question }),
      ...(optionA && { optionA }),
      ...(optionB && { optionB }),
      ...(optionC && { optionC }),
      ...(optionD && { optionD }),
      ...(correctOption && { correctOption }),
      ...(difficulty && { difficulty }),
      ...(categoryId && { categoryId: parseInt(categoryId) })
    };

    if (subCategoryId !== undefined) {
      dataToUpdate.subCategoryId = subCategoryId ? parseInt(subCategoryId) : null;
    }

    const mcq = await prisma.mCQ.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    res.json(mcq);
  } catch (error) {
    console.error('updateMCQ Error:', error);
    res.status(500).json({ error: 'Failed to update MCQ' });
  }
};

export const deleteMCQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.mCQ.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete MCQ' });
  }
};

export const createExam = async (req: Request, res: Response) => {
  try {
    const { title, categoryId, duration, type, totalMarks, instructions, status, generatorConfig } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    let finalMcqIds: number[] = [];

    if (generatorConfig) {
      if (generatorConfig.mode === 'manual' && generatorConfig.manualMcqIds) {
        finalMcqIds = generatorConfig.manualMcqIds;
      } else if (generatorConfig.mode === 'random') {
        const { allocations, difficulty } = generatorConfig;

        if (allocations && allocations.length > 0) {
          for (const alloc of allocations) {
            const whereClause: any = { categoryId: alloc.subjectId };
            if (difficulty && difficulty !== 'Mixed') {
              whereClause.difficulty = { equals: difficulty, mode: 'insensitive' };
            }
            const matchingMcqs = await prisma.mCQ.findMany({
              where: whereClause,
              select: { id: true }
            });
            const shuffled = matchingMcqs.sort(() => 0.5 - Math.random());
            finalMcqIds.push(...shuffled.slice(0, alloc.count).map((m: { id: number }) => m.id));
          }
        } else {
          const limit = 100;
          const whereClause: any = {};
          if (difficulty && difficulty !== 'Mixed') {
            whereClause.difficulty = { equals: difficulty, mode: 'insensitive' };
          }
          const matchingMcqs = await prisma.mCQ.findMany({
            where: whereClause,
            select: { id: true }
          });
          const shuffled = matchingMcqs.sort(() => 0.5 - Math.random());
          finalMcqIds = shuffled.slice(0, limit).map((m: { id: number }) => m.id);
        }
      }
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        duration: duration || 5400,
        totalMarks: totalMarks || 100,
        type: type || 'Free',
        instructions: instructions || '',
        status: status || 'Draft',
        mcqIds: finalMcqIds,
        ...(categoryId && { categoryId: parseInt(categoryId) })
      }
    });
    await prisma.activityLog.create({ data: { action: 'Created', entity: `Exam: ${title}` } });
    res.status(201).json(exam);
  } catch (error) {
    console.error('createExam Error:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

export const deleteExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exam = await prisma.exam.delete({ where: { id: parseInt(id) } });
    await prisma.activityLog.create({ data: { action: 'Deleted', entity: `Exam: ${exam.title}` } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};

export const createPastPaper = async (req: Request, res: Response) => {
  try {
    const { title, year, subject, type, mcqIds } = req.body;
    let finalMcqIds: number[] = [];
    if (mcqIds) {
      finalMcqIds = mcqIds.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
    }
    const paper = await prisma.pastPaper.create({
      data: { title, year: year.toString(), subject, type: type || 'Free', mcqIds: finalMcqIds }
    });
    await prisma.activityLog.create({ data: { action: 'Created', entity: `Past Paper: ${title}` } });
    res.status(201).json(paper);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create past paper' });
  }
};

export const deletePastPaper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paper = await prisma.pastPaper.delete({ where: { id: parseInt(id) } });
    await prisma.activityLog.create({ data: { action: 'Deleted', entity: `Past Paper: ${paper.title}` } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete past paper' });
  }
};

// --- BUSINESS ---
export const getBusiness = async (req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { startDate: 'desc' }
    });
    const coupons = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    
    res.json({ subscriptions, coupons });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch business data' });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { email, plan, amount } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found with this email' });
    
    let months = 1;
    if (plan === '3 Months') months = 3;
    if (plan === '6 Months') months = 6;
    if (plan === '1 Year') months = 12;

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const sub = await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'Premium',
        startDate: new Date(),
        endDate,
        isActive: true,
      }
    });

    res.json(sub);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: { isActive: false, endDate: new Date() } // also set endDate to now so it expires immediately
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke subscription' });
  }
};

// Approve a user-submitted manual payment (Easypaisa/JazzCash/bank).
// The admin is expected to verify the transaction ID against the receiving
// account before calling this.
export const approveSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: { isActive: true }
    });
    // Grant premium access for the subscription period
    await prisma.user.update({
      where: { id: subscription.userId },
      data: { role: 'PREMIUM' }
    });
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve subscription' });
  }
};

export const createPromoCode = async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, usageLimit, expiryDate, status } = req.body;
    const promo = await prisma.promoCode.create({
      data: {
        code,
        discountType,
        discountValue: parseInt(discountValue) || 0,
        usageLimit: parseInt(usageLimit) || 0,
        expiryDate: new Date(expiryDate),
        status,
        usedCount: 0
      }
    });
    res.json(promo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create promo code' });
  }
};

export const deletePromoCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.promoCode.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete promo code' });
  }
};

// --- CONTENT ---
export const getContent = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
    const activityLogs = await prisma.activityLog.findMany({ 
      take: 100, 
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { name: true, email: true } } }
    });
    
    res.json({ announcements, jobs, testimonials, faqs, activityLogs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content data' });
  }
};

// --- COMMUNICATIONS ---
export const getCommunications = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch communications data' });
  }
};

export const deleteCommunication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.contactMessage.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

export const updateCommunicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;
    await prisma.contactMessage.update({
      where: { id: parseInt(id) },
      data: { status: isRead ? 'Read' : 'Unread' }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message status' });
  }
};

// --- CONTENT CRUD ---
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, type, body, link } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
    const item = await prisma.announcement.create({ data: { title, type: type || 'Info', body, link } });
    await prisma.activityLog.create({ data: { action: 'Created', entity: `Announcement: ${title}` } });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, role, quote, rating, avatar } = req.body;
    const item = await prisma.testimonial.create({ data: { name, role, quote, rating: parseInt(rating), avatar } });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    await prisma.testimonial.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
};

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, quote, rating, avatar } = req.body;
    const item = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: { name, role, quote, rating: parseInt(rating), avatar }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
};

export const createFAQ = async (req: Request, res: Response) => {
  try {
    const { question, answer, order } = req.body;
    const item = await prisma.fAQ.create({ data: { question, answer, order: parseInt(order) || 0 } });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
};

export const deleteFAQ = async (req: Request, res: Response) => {
  try {
    await prisma.fAQ.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
};

export const updateFAQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer, order } = req.body;
    const item = await prisma.fAQ.update({
      where: { id: parseInt(id) },
      data: { question, answer, order: parseInt(order) || 0 }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const formatted = settings.reduce((acc: any, curr: any) => { acc[curr.key] = curr.value; return acc; }, {});
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const getMedia = async (req: Request, res: Response) => {
  try {
    const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
};

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const { originalname, size, filename } = req.file;
    const type = originalname.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    const sizeStr = (size / (1024 * 1024)).toFixed(2) + ' MB';
    const url = `/uploads/${filename}`;
    
    const media = await prisma.media.create({
      data: { name: originalname, type, size: sizeStr, url }
    });
    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload media' });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await prisma.media.findUnique({ where: { id: parseInt(id) } });
    if (!media) return res.status(404).json({ error: 'Media not found' });
    
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../', media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await prisma.media.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.announcement.delete({ where: { id: parseInt(id) } });
    await prisma.activityLog.create({ data: { action: 'Deleted', entity: `Announcement: ${item.title}` } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, organization, location, salary, deadline, applyLink, description } = req.body;
    if (!title || !organization) return res.status(400).json({ error: 'Title and organization are required' });
    const job = await prisma.job.create({
      data: { title, organization, location, salary, deadline: new Date(deadline), applyLink, description }
    });
    await prisma.activityLog.create({ data: { action: 'Created', entity: `Job: ${title}` } });
    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.delete({ where: { id: parseInt(id) } });
    await prisma.activityLog.create({ data: { action: 'Deleted', entity: `Job: ${job.title}` } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

// --- USER MANAGEMENT ---
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['USER', 'PREMIUM', 'ADMIN'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const user = await prisma.user.update({ where: { id: parseInt(id) }, data: { role } });
    await prisma.activityLog.create({ data: { action: 'Updated Role', entity: `User: ${user.email} → ${role}` } });
    res.json({ success: true, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.delete({ where: { id: parseInt(id) } });
    await prisma.activityLog.create({ data: { action: 'Deleted', entity: `User: ${user.email}` } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ============================================
// TOPIC (SUBTOPIC) MANAGER CRUD
// ============================================

export const getTopics = async (req: Request, res: Response) => {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        subCategory: {
          include: {
            category: { select: { id: true, name: true } }
          }
        },
        _count: { select: { mcqs: true } }
      },
      orderBy: { id: 'desc' }
    });
    res.json(topics);
  } catch (error) {
    console.error('getTopics Error:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

export const getTopicsBySubCategory = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.params;
    const topics = await prisma.topic.findMany({
      where: { subCategoryId: parseInt(subCategoryId) },
      include: {
        subCategory: {
          include: {
            category: { select: { id: true, name: true } }
          }
        },
        _count: { select: { mcqs: true } }
      },
      orderBy: { id: 'desc' }
    });
    res.json(topics);
  } catch (error) {
    console.error('getTopicsBySubCategory Error:', error);
    res.status(500).json({ error: 'Failed to fetch topics for subcategory' });
  }
};

export const createNewTopic = async (req: Request, res: Response) => {
  try {
    const { name, description, level, subCategoryId } = req.body;
    if (!name || !subCategoryId) {
      return res.status(400).json({ error: 'Name and subCategoryId are required' });
    }
    const topic = await prisma.topic.create({
      data: {
        name,
        description,
        level: level || 'beginner',
        subCategoryId: parseInt(subCategoryId)
      }
    });
    res.status(201).json(topic);
  } catch (error) {
    console.error('createNewTopic Error:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, level, subCategoryId } = req.body;
    const topic = await prisma.topic.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(level && { level }),
        ...(subCategoryId && { subCategoryId: parseInt(subCategoryId) })
      }
    });
    res.json(topic);
  } catch (error) {
    console.error('updateTopic Error:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topicId = parseInt(id);
    await prisma.mCQ.deleteMany({ where: { topicId } });
    await prisma.topic.delete({ where: { id: topicId } });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteTopic Error:', error);
    res.status(500).json({ error: 'Failed to delete topic. Ensure no linked MCQs.' });
  }
};

// ============================================
// DRILL-DOWN SUBJECTS MANAGER
// SubCategory (Topic) CRUD per Category
// ============================================

export const getTopicsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const topics = await prisma.subCategory.findMany({
      where: { categoryId: parseInt(categoryId) },
      include: {
        _count: { select: { topics: true, mcqs: true } }
      },
      orderBy: { id: 'asc' }
    });
    res.json(topics);
  } catch (error) {
    console.error('getTopicsByCategory Error:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

export const createAdminTopic = async (req: Request, res: Response) => {
  try {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) return res.status(400).json({ error: 'name and categoryId are required' });
    const topic = await prisma.subCategory.create({
      data: { name, categoryId: parseInt(categoryId) }
    });
    res.status(201).json(topic);
  } catch (error) {
    console.error('createAdminTopic Error:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
};

export const createAdminTopicBulk = async (req: Request, res: Response) => {
  try {
    const { names, categoryId } = req.body;
    if (!names || !Array.isArray(names) || !categoryId) return res.status(400).json({ error: 'names array and categoryId are required' });
    
    const count = await prisma.subCategory.createMany({
      data: names.map((name: string) => ({ name, categoryId: parseInt(categoryId) })),
      skipDuplicates: true
    });
    res.status(201).json({ success: true, count: count.count });
  } catch (error) {
    console.error('createAdminTopicBulk Error:', error);
    res.status(500).json({ error: 'Failed to bulk create topics' });
  }
};

export const bulkUploadTopicsAndSubtopics = async (req: Request, res: Response) => {
  try {
    const { categoryId, data } = req.body;
    if (!categoryId || !data) return res.status(400).json({ error: 'categoryId and data are required' });

    await prisma.$transaction(async (tx: any) => {
      for (const item of data) {
        // Create Topic (SubCategory in DB)
        const subCat = await tx.subCategory.create({
          data: { name: item.topicName, categoryId: parseInt(categoryId) }
        });

        // Create Subtopics (Topic in DB)
        if (item.subtopics && item.subtopics.length > 0) {
          const subtopicsToCreate = item.subtopics.map((stName: string) => ({
            name: stName,
            subCategoryId: subCat.id,
            level: 'beginner'
          }));
          await tx.topic.createMany({
            data: subtopicsToCreate
          });
        }
      }
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('bulkUploadTopicsAndSubtopics Error:', error);
    res.status(500).json({ error: 'Failed to bulk upload' });
  }
};

export const updateAdminTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const topic = await prisma.subCategory.update({
      where: { id: parseInt(id) },
      data: { name }
    });
    res.json(topic);
  } catch (error) {
    console.error('updateAdminTopic Error:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
};

export const deleteAdminTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subCatId = parseInt(id);
    await prisma.mCQ.deleteMany({ where: { subCategoryId: subCatId } });
    await prisma.subCategory.delete({ where: { id: subCatId } });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteAdminTopic Error:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
};

// Topic model (Subtopic) CRUD per SubCategory
export const getSubtopicsByTopic = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.params;
    const subtopics = await prisma.topic.findMany({
      where: { subCategoryId: parseInt(subCategoryId) },
      include: { content: { select: { id: true } } },
      orderBy: { id: 'asc' }
    });
    const result = subtopics.map((s: any) => ({ ...s, hasContent: !!s.content }));
    res.json(result);
  } catch (error) {
    console.error('getSubtopicsByTopic Error:', error);
    res.status(500).json({ error: 'Failed to fetch subtopics' });
  }
};

export const createSubtopic = async (req: Request, res: Response) => {
  try {
    const { name, description, level, subCategoryId } = req.body;
    if (!name || !subCategoryId) return res.status(400).json({ error: 'name and subCategoryId are required' });
    const subtopic = await prisma.topic.create({
      data: { name, description, level: level || 'beginner', subCategoryId: parseInt(subCategoryId) }
    });
    res.status(201).json(subtopic);
  } catch (error) {
    console.error('createSubtopic Error:', error);
    res.status(500).json({ error: 'Failed to create subtopic' });
  }
};

export const updateSubtopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, level } = req.body;
    const subtopic = await prisma.topic.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(level && { level })
      }
    });
    res.json(subtopic);
  } catch (error) {
    console.error('updateSubtopic Error:', error);
    res.status(500).json({ error: 'Failed to update subtopic' });
  }
};

export const deleteSubtopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topicId = parseInt(id);
    await prisma.mCQ.deleteMany({ where: { topicId } });
    await prisma.topic.delete({ where: { id: topicId } });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteSubtopic Error:', error);
    res.status(500).json({ error: 'Failed to delete subtopic' });
  }
};

// SubtopicContent CRUD
export const getSubtopicContent = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const content = await prisma.subtopicContent.findUnique({
      where: { topicId: parseInt(topicId) }
    });
    res.json(content || null);
  } catch (error) {
    console.error('getSubtopicContent Error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

export const upsertSubtopicContent = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { bodyText, tables, keyPoints, references } = req.body;
    const content = await prisma.subtopicContent.upsert({
      where: { topicId: parseInt(topicId) },
      update: {
        ...(bodyText !== undefined && { bodyText }),
        ...(tables !== undefined && { tables }),
        ...(keyPoints !== undefined && { keyPoints }),
        ...(references !== undefined && { references })
      },
      create: {
        topicId: parseInt(topicId),
        bodyText: bodyText || null,
        tables: tables || null,
        keyPoints: keyPoints || null,
        references: references || null
      }
    });
    res.json(content);
  } catch (error) {
    console.error('upsertSubtopicContent Error:', error);
    res.status(500).json({ error: 'Failed to save content' });
  }
};
