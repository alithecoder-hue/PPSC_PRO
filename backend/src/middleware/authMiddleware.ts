import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header missing' });
  }
};

// Premium = role PREMIUM/ADMIN, or any active, unexpired subscription.
// Re-fetched from the DB every time so a revoked/expired subscription (or a
// role changed after the token was issued) is honoured immediately — the
// JWT's role claim alone is never trusted for gating (audit H10/H12).
export const hasPremium = async (userId: number): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscriptions: {
        where: { isActive: true, endDate: { gt: new Date() } },
        select: { id: true },
      },
    },
  });
  if (!user) return false;
  return user.role === 'PREMIUM' || user.role === 'ADMIN' || user.subscriptions.length > 0;
};

export const FREE_MOCK_TESTS_PER_MONTH = 5;

// Gate for exam generation (audit H2): premium members pass; free members
// get the marketed 5 mock tests per calendar month, then a 402.
export const requirePremium = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.user?.userId);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    if (await hasPremium(userId)) {
      return next();
    }
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const used = await prisma.examResult.count({
      where: { userId, completedAt: { gte: startOfMonth } },
    });
    if (used < FREE_MOCK_TESTS_PER_MONTH) {
      return next();
    }
    return res.status(402).json({
      error: 'Monthly free mock limit reached — upgrade for unlimited',
      freeMockLimit: FREE_MOCK_TESTS_PER_MONTH,
      used,
    });
  } catch (error) {
    console.error('requirePremium error:', error);
    return res.status(500).json({ error: 'Failed to check premium access' });
  }
};

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.user?.userId);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    // Re-check the role in the DB (audit H10): a token issued before a
    // demotion must not keep admin access.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user && user.role === 'ADMIN') {
      return next();
    }
    return res.status(403).json({ error: 'Requires admin privileges' });
  } catch (error) {
    console.error('isAdmin error:', error);
    return res.status(500).json({ error: 'Failed to check admin access' });
  }
};
