import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

/**
 * Manual mobile-money verification flow (Easypaisa / JazzCash / bank transfer).
 *
 * There is no payment-gateway API to check the transaction against, so this
 * endpoint does NOT activate premium. It records the user's payment claim as
 * an INACTIVE subscription; an admin verifies the transaction ID against the
 * receiving account and approves it from the admin panel
 * (POST /api/admin/business/subscription/:id/approve).
 */
export const verifySubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planId, transactionId, paymentMethod, promoCode } = req.body;

    if (!planId || !transactionId || String(transactionId).trim().length < 6) {
      return res.status(400).json({ error: 'A valid transaction ID is required' });
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
        // Stays inactive until an admin verifies the payment
        isActive: false,
        transactionId: String(transactionId).trim(),
        paymentMethod: paymentMethod ? String(paymentMethod) : null,
      }
    });

    res.status(201).json({
      message: 'Payment submitted for verification. Premium will activate once our team confirms your transaction.',
      subscription,
      discountApplied
    });
  } catch (error) {
    console.error('Verify Subscription Error:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
};
