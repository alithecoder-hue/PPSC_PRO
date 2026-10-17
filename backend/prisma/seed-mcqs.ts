/**
 * MCQ bank importer.
 *
 * Reads every *.json file in prisma/mcq-bank/ (except README) and inserts
 * the questions, resolving subject -> Category, topic -> SubCategory,
 * subtopic -> Topic by exact name (the same hierarchy src/seed.ts builds).
 *
 * Idempotent: a question whose exact text already exists for the same
 * category is skipped.
 *
 * Usage:
 *   npx ts-node prisma/seed-mcqs.ts --dry-run   # validate only
 *   npx ts-node prisma/seed-mcqs.ts             # import
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BankQuestion {
  subject: string;
  topic: string;
  subtopic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: string;
}

const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const DRY_RUN = process.argv.includes('--dry-run');

function fail(msg: string): never {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function validate(q: BankQuestion, file: string, idx: number): void {
  const where = `${file}#${idx}`;
  if (!q.subject || !q.topic || !q.subtopic) fail(`${where}: subject/topic/subtopic required`);
  if (!q.question || !/[?:]\s*$/.test(q.question.trim())) fail(`${where}: question must end with '?' or ':'`);
  if (!Array.isArray(q.options) || q.options.length !== 4) fail(`${where}: exactly 4 options required`);
  if (q.options.some((o) => !o || !o.trim())) fail(`${where}: options must be non-empty`);
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) fail(`${where}: correct must be 0-3`);
  if (!q.explanation || !q.explanation.trim()) fail(`${where}: explanation required`);
  if (!DIFFICULTIES.has(q.difficulty)) fail(`${where}: difficulty must be easy|medium|hard`);
}

async function main(): Promise<void> {
  const dir = __dirname + '/mcq-bank';
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  if (files.length === 0) fail('no question files found in prisma/mcq-bank/');

  let inserted = 0;
  let skipped = 0;
  let unresolved = 0;

  // Cache lookups: subject -> category, topic -> subCategory, subtopic -> topic
  const catCache = new Map<string, number>();
  const subCache = new Map<string, number>();
  const topCache = new Map<string, number>();

  async function resolveIds(q: BankQuestion): Promise<{ categoryId: number; subCategoryId: number; topicId: number } | null> {
    let categoryId = catCache.get(q.subject);
    if (categoryId === undefined) {
      const c = await prisma.category.findFirst({ where: { name: q.subject } });
      if (!c) return null;
      categoryId = c.id;
      catCache.set(q.subject, categoryId);
    }
    const subKey = `${q.subject}||${q.topic}`;
    let subCategoryId = subCache.get(subKey);
    if (subCategoryId === undefined) {
      const s = await prisma.subCategory.findFirst({
        where: { name: q.topic, categoryId },
      });
      if (!s) return null;
      subCategoryId = s.id;
      subCache.set(subKey, subCategoryId);
    }
    const topKey = `${subKey}||${q.subtopic}`;
    let topicId = topCache.get(topKey);
    if (topicId === undefined) {
      const t = await prisma.topic.findFirst({
        where: { name: q.subtopic, subCategoryId },
      });
      if (!t) return null;
      topicId = t.id;
      topCache.set(topKey, topicId);
    }
    return { categoryId, subCategoryId, topicId };
  }

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    let questions: BankQuestion[];
    try {
      questions = JSON.parse(raw);
    } catch {
      fail(`${file}: invalid JSON`);
    }
    if (!Array.isArray(questions)) fail(`${file}: top level must be an array`);

    // duplicate question texts within the file
    const seen = new Set<string>();
    questions.forEach((q, i) => {
      validate(q, file, i);
      const key = q.question.trim().toLowerCase();
      if (seen.has(key)) fail(`${file}#${i}: duplicate question text`);
      seen.add(key);
    });

    console.log(`\n${file}: ${questions.length} questions`);

    for (const q of questions) {
      const ids = DRY_RUN ? { categoryId: 0, subCategoryId: 0, topicId: 0 } : await resolveIds(q);
      if (!ids) {
        unresolved++;
        console.warn(`  ! unresolved hierarchy: ${q.subject} / ${q.topic} / ${q.subtopic}`);
        continue;
      }
      if (DRY_RUN) continue;

      const exists = await prisma.mCQ.findFirst({
        where: { question: q.question.trim(), categoryId: ids.categoryId },
      });
      if (exists) {
        skipped++;
        continue;
      }

      const letters = ['A', 'B', 'C', 'D'];
      await prisma.mCQ.create({
        data: {
          question: q.question.trim(),
          optionA: q.options[0].trim(),
          optionB: q.options[1].trim(),
          optionC: q.options[2].trim(),
          optionD: q.options[3].trim(),
          correctOption: letters[q.correct],
          explanation: q.explanation.trim(),
          difficulty: q.difficulty,
          categoryId: ids.categoryId,
          subCategoryId: ids.subCategoryId,
          topicId: ids.topicId,
        },
      });
      inserted++;
    }
  }

  console.log('\n================================');
  console.log(DRY_RUN ? 'Dry run complete (no writes).' : 'Import complete.');
  console.log(`  Inserted   : ${inserted}`);
  console.log(`  Skipped    : ${skipped} (already in DB)`);
  console.log(`  Unresolved : ${unresolved} (bad subject/topic/subtopic names)`);
  console.log('================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
