/**
 * One-time admin access fix.
 *
 * The seed creates ali@meritmaster.pk with a placeholder password ('hash'),
 * so the admin account cannot log in. This script sets a real bcrypt
 * password and ensures the ADMIN role.
 *
 * Usage (with DATABASE_URL exported):
 *   npx ts-node prisma/fix-admin.ts ali@meritmaster.pk <new-password>
 *
 * Then log in at /login — admins are redirected to /admin automatically.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: npx ts-node prisma/fix-admin.ts <email> <new-password>');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: 'ADMIN' },
    create: { email, name: 'Ali Tahir', password: hash, role: 'ADMIN' },
  });
  console.log(`OK: ${user.email} is now ADMIN. Log in at /login.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
