import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifySubscription = async (req: Request, res: Response) => {
  try {
    const { userId, planId, transactionId, promoCode } = req.body;
    
    if (!userId || !planId || !transactionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Optional: check promo code
    let discountApplied = 0;
    if (promoCode) {
      const code = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (code && code.status === 'Active' && new Date(code.expiryDate) > new Date()) {
        discountApplied = code.discountValue;
        await prisma.promoCode.update({
          where: { id: code.id },
          data: { usedCount: { increment: 1 } }
        });
      }
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (planId === 'yearly' ? 12 : 1));

    const subscription = await prisma.subscription.create({
      data: {
        userId: Number(userId),
        plan: planId,
        startDate,
        endDate,
        isActive: true
      }
    });

    res.status(201).json({ message: 'Subscription verified and activated', subscription, discountApplied });
  } catch (error) {
    console.error('Verify Subscription Error:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
};
