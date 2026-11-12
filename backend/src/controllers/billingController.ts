import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Server-side price map (Rs) — the single source of truth for what a plan
// costs. The client never sends a price (audit H8).
export const PLAN_PRICES: Record<string, number> = {
  premium: 399,
  yearly: 2999,
};
export const PLAN_MONTHS: Record<string, number> = {
  premium: 1,
  yearly: 12,
};

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

    // Whitelist the plan (audit H8): any other string used to silently
    // create a 1-month subscription.
    if (!planId || !(planId in PLAN_PRICES)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    if (!transactionId || String(transactionId).trim().length < 6) {
      return res.status(400).json({ error: 'A valid transaction ID is required' });
    }
    const cleanTransactionId = String(transactionId).trim();

    // One transaction ID pays for one subscription (audit H8): refuse a
    // duplicate claim instead of creating a second record for it.
    const existing = await prisma.subscription.findFirst({
      where: { transactionId: cleanTransactionId },
    });
    if (existing) {
      return res.status(409).json({ error: 'This transaction ID has already been submitted' });
    }

    // Validate the promo code but do NOT increment usedCount here — that
    // happens only when an admin approves the payment (audit H8).
    let discountApplied = 0;
    let appliedPromoCode: string | null = null;
    if (promoCode) {
      const code = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (code && code.status === 'Active' && new Date(code.expiryDate) > new Date()) {
        if (code.usageLimit > 0 && code.usedCount >= code.usageLimit) {
          return res.status(400).json({ error: 'This promo code has reached its usage limit' });
        }
        discountApplied = code.discountValue;
        appliedPromoCode = code.code;
      }
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + PLAN_MONTHS[planId]);

    const subscription = await prisma.subscription.create({
      data: {
        userId: Number(userId),
        plan: planId,
        startDate,
        endDate,
        // Stays inactive until an admin verifies the payment
        isActive: false,
        transactionId: cleanTransactionId,
        paymentMethod: paymentMethod ? String(paymentMethod) : null,
        amount: PLAN_PRICES[planId],
        promoCode: appliedPromoCode,
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
