import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.mCQ.count();
  console.log("Total MCQs in DB:", count);
}
main().finally(() => prisma.$disconnect());
