-- Merit Master — manual schema patch, 2026-11-12
-- Adds the two Subscription columns the audit-fix backend code needs:
--   amount    (Rs price at submit time, audit H8)
--   promoCode (promo applied at submit time; usedCount moves only on approval)
--
-- WHY MANUAL: the VM cannot download the Prisma engines (egress proxy),
-- so `prisma migrate diff` / `migrate dev` cannot run here, and
-- backend/prisma/migrations/ still does not exist (audit H13).
-- Run this in the Supabase SQL editor (project lqynunyclkgdxmybdtug)
-- BEFORE the backend deploy that contains these fields lands, or the
-- backend will error on every Subscription read/write (Prisma selects the
-- new columns). It is idempotent — safe to run twice.
-- When Ali next runs `npx prisma migrate dev --name init` on his laptop,
-- the generated initial migration will absorb these two columns; do NOT
-- also create a Prisma migration for them from here.

ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "amount" INTEGER;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "promoCode" TEXT;
