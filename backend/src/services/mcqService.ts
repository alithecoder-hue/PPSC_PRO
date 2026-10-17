import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMCQs = async (categoryId?: number, subCategoryId?: number, topicId?: number, limit: number = 10) => {
  return await prisma.mCQ.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(subCategoryId && { subCategoryId }),
      ...(topicId && { topicId }),
    },
    take: limit,
  });
};

export const createMCQ = async (data: any) => {
  return await prisma.mCQ.create({
    data,
  });
};

export const getExamSession = async (limit: number = 100) => {
  // Random MCQs for exam session
  const mcqs = await prisma.$queryRaw`SELECT id, question, "optionA", "optionB", "optionC", "optionD" FROM "MCQ" ORDER BY RANDOM() LIMIT ${limit}`;
  return mcqs;
};

export const getCustomExamSession = async (config: { categoryId?: number | null, limit: number, difficulty?: string }[]) => {
  let combinedMcqs: any[] = [];
  
  for (const item of config) {
    if (item.limit > 0) {
      let mcqs;
      if (item.categoryId) {
        if (item.difficulty && item.difficulty !== 'any') {
          mcqs = await prisma.$queryRaw`
            SELECT id, question, "optionA", "optionB", "optionC", "optionD" 
            FROM "MCQ" 
            WHERE "categoryId" = ${item.categoryId} AND difficulty = ${item.difficulty}
            ORDER BY RANDOM() 
            LIMIT ${item.limit}
          `;
        } else {
          mcqs = await prisma.$queryRaw`
            SELECT id, question, "optionA", "optionB", "optionC", "optionD" 
            FROM "MCQ" 
            WHERE "categoryId" = ${item.categoryId}
            ORDER BY RANDOM() 
            LIMIT ${item.limit}
          `;
        }
      } else {
        if (item.difficulty && item.difficulty !== 'any') {
          mcqs = await prisma.$queryRaw`
            SELECT id, question, "optionA", "optionB", "optionC", "optionD" 
            FROM "MCQ" 
            WHERE difficulty = ${item.difficulty}
            ORDER BY RANDOM() 
            LIMIT ${item.limit}
          `;
        } else {
          mcqs = await prisma.$queryRaw`
            SELECT id, question, "optionA", "optionB", "optionC", "optionD" 
            FROM "MCQ" 
            ORDER BY RANDOM() 
            LIMIT ${item.limit}
          `;
        }
      }
      combinedMcqs = [...combinedMcqs, ...(mcqs as any[])];
    }
  }

  // Shuffle the combined array
  for (let i = combinedMcqs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinedMcqs[i], combinedMcqs[j]] = [combinedMcqs[j], combinedMcqs[i]];
  }

  return combinedMcqs;
};
