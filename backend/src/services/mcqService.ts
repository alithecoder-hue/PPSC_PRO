import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllMCQs = async (categoryId?: number, subCategoryId?: number, topicId?: number, limit: number = 10) => {
  return await prisma.mCQ.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(subCategoryId && { subCategoryId }),
      ...(topicId && { topicId }),
    },
    take: Math.max(1, Math.min(Math.floor(limit) || 10, 100)),
  });
};

export const createMCQ = async (data: any) => {
  return await prisma.mCQ.create({
    data,
  });
};

// The shape the classroom test engine expects:
// { id, text, options: [{id:'A',text},...], correct: 'A'|'B'|'C'|'D', explanation }
export const formatExamMcq = (row: any) => ({
  id: row.id,
  text: row.question,
  options: [
    { id: 'A', text: row.optionA },
    { id: 'B', text: row.optionB },
    { id: 'C', text: row.optionC },
    { id: 'D', text: row.optionD },
  ],
  correct: row.correctOption,
  explanation: row.explanation || '',
  // Subject name, so the analysis screen can break a test down per subject.
  subject: row.categoryName || 'Mixed',
});

export const getExamSession = async (limit: number = 100) => {
  // Random MCQs for exam session. Answers are included because only the
  // classroom practice/test engine consumes this endpoint, and it grades instantly.
  const safeLimit = Math.max(1, Math.min(Math.floor(limit) || 100, 100));
  const mcqs = await prisma.$queryRaw`SELECT m.id, m.question, m."optionA", m."optionB", m."optionC", m."optionD", m."correctOption", m.explanation, c.name AS "categoryName" FROM "MCQ" m LEFT JOIN "Category" c ON c.id = m."categoryId" ORDER BY RANDOM() LIMIT ${safeLimit}`;
  return (mcqs as any[]).map(formatExamMcq);
};

export const getCustomExamSession = async (config: { categoryId?: number | null, limit: number, difficulty?: string }[]) => {
  let combinedMcqs: any[] = [];
  // Never let one request pull the whole bank: at most 16 subject slices.
  const safeConfig = config.slice(0, 16);

  for (const item of safeConfig) {
    // Clamp each slice so a huge limit cannot dump the bank.
    item.limit = Math.max(0, Math.min(Math.floor(item.limit) || 0, 100));
    if (item.limit > 0) {
      let mcqs;
      if (item.categoryId) {
        if (item.difficulty && item.difficulty !== 'any') {
          mcqs = await prisma.$queryRaw`
            SELECT m.id, m.question, m."optionA", m."optionB", m."optionC", m."optionD", m."correctOption", m.explanation, c.name AS "categoryName" 
            FROM "MCQ" m LEFT JOIN "Category" c ON c.id = m."categoryId" 
            WHERE "categoryId" = ${item.categoryId} AND difficulty = ${item.difficulty}
            ORDER BY RANDOM() 
            LIMIT ${item.limit}
          `;
        } else {
          mcqs = await prisma.$queryRaw`
            SELECT m.id, m.question, m."optionA", m."optionB", m."optionC", m."optionD", m."correctOption", m.explanation, c.name AS "categoryName" 
            FROM "MCQ" m LEFT JOIN "Category" c ON c.id = m."categoryId" 
            WHERE "categoryId" = ${item.categoryId}
            ORDER BY RANDOM() 
            LIMIT ${item.limit}
          `;
        }
      } else {
        if (item.difficulty && item.difficulty !== 'any') {
          mcqs = await prisma.$queryRaw`
            SELECT m.id, m.question, m."optionA", m."optionB", m."optionC", m."optionD", m."correctOption", m.explanation, c.name AS "categoryName" 
            FROM "MCQ" m LEFT JOIN "Category" c ON c.id = m."categoryId" 
            WHERE difficulty = ${item.difficulty}
            ORDER BY RANDOM() 
            LIMIT ${item.limit}
          `;
        } else {
          mcqs = await prisma.$queryRaw`
            SELECT m.id, m.question, m."optionA", m."optionB", m."optionC", m."optionD", m."correctOption", m.explanation, c.name AS "categoryName" 
            FROM "MCQ" m LEFT JOIN "Category" c ON c.id = m."categoryId" 
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

  return combinedMcqs.map(formatExamMcq);
};
