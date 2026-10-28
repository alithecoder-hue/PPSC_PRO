/**
 * Study-content importer.
 *
 * Reads every *.json file in prisma/content-bank/ (each file is an array of
 * entries shaped like the SubtopicContent model) and upserts the content,
 * resolving subject -> Category, topic -> SubCategory, subtopic -> Topic
 * by exact name (the same hierarchy src/seed.ts builds).
 *
 * Entry shape:
 *   {
 *     "subject": "Computer Studies",
 *     "topic": "Introduction to Computers",
 *     "subtopic": "Generations of Computers (1st to 5th)",
 *     "bodyText": "<h2>...</h2><p>...</p>",
 *     "keyPoints": ["one-liner fact", "..."],
 *     "tables": [{ "title": "...", "headers": ["..", ".."], "rows": [["..", ".."]] }],
 *     "references": [{ "label": "...", "value": "..." }]
 *   }
 *
 * Idempotent: re-running updates the content for the same subtopic.
 *
 * Usage:
 *   npx ts-node prisma/seed-content.ts --dry-run   # validate only
 *   npx ts-node prisma/seed-content.ts              # import
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ContentTable {
  title: string;
  headers: string[];
  rows: string[][];
}

interface ContentEntry {
  subject: string;
  topic: string;
  subtopic: string;
  bodyText: string;
  keyPoints: string[];
  tables?: ContentTable[];
  references?: { label: string; value: string }[];
}

const DRY_RUN = process.argv.includes('--dry-run');

function fail(msg: string): never {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function validate(e: ContentEntry, file: string, idx: number): void {
  const where = `${file}#${idx}`;
  if (!e.subject || !e.topic || !e.subtopic) fail(`${where}: subject/topic/subtopic required`);
  if (!e.bodyText || !e.bodyText.trim()) fail(`${where}: bodyText required`);
  if (!Array.isArray(e.keyPoints) || e.keyPoints.length === 0) fail(`${where}: keyPoints (one-liners) required`);
  if (e.keyPoints.some((k) => !k || !k.trim())) fail(`${where}: keyPoints must be non-empty`);
  if (e.tables) {
    e.tables.forEach((t, ti) => {
      if (!t.title || !Array.isArray(t.headers) || t.headers.length === 0) fail(`${where} table#${ti}: title + headers required`);
      if (!Array.isArray(t.rows)) fail(`${where} table#${ti}: rows required`);
    });
  }
  if (e.references) {
    e.references.forEach((r, ri) => {
      if (!r.label || !r.value) fail(`${where} reference#${ri}: label + value required`);
    });
  }
}

async function main(): Promise<void> {
  const dir = __dirname + '/content-bank';
  const files: string[] = [];
  const walk = (d: string): void => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith('.json')) files.push(p);
    }
  };
  if (!fs.existsSync(dir)) fail('no prisma/content-bank/ directory found');
  walk(dir);
  files.sort();
  if (files.length === 0) fail('no content files found in prisma/content-bank/');

  let inserted = 0;
  let updated = 0;
  let unresolved = 0;

  for (const file of files) {
    const rel = path.relative(dir, file);
    let entries: ContentEntry[];
    try {
      entries = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
      fail(`${rel}: invalid JSON`);
    }
    if (!Array.isArray(entries)) fail(`${rel}: top level must be an array`);
    entries.forEach((e, i) => validate(e, rel, i));
    console.log(`\n${rel}: ${entries.length} entries`);

    for (const e of entries) {
      if (DRY_RUN) continue;
      const category = await prisma.category.findFirst({ where: { name: e.subject } });
      const sub = category
        ? await prisma.subCategory.findFirst({ where: { name: e.topic, categoryId: category.id } })
        : null;
      const topic = sub
        ? await prisma.topic.findFirst({ where: { name: e.subtopic, subCategoryId: sub.id } })
        : null;
      if (!topic) {
        unresolved++;
        console.warn(`  ! unresolved hierarchy: ${e.subject} / ${e.topic} / ${e.subtopic}`);
        continue;
      }
      const existing = await prisma.subtopicContent.findUnique({ where: { topicId: topic.id } });
      const data = {
        bodyText: e.bodyText.trim(),
        keyPoints: e.keyPoints.map((k) => k.trim()),
        tables: e.tables ?? undefined,
        references: e.references ?? undefined,
      };
      if (existing) {
        await prisma.subtopicContent.update({ where: { topicId: topic.id }, data });
        updated++;
      } else {
        await prisma.subtopicContent.create({ data: { topicId: topic.id, ...data } });
        inserted++;
      }
    }
  }

  console.log('\n================================');
  console.log(DRY_RUN ? 'Dry run complete (no writes).' : 'Import complete.');
  console.log(`  Inserted   : ${inserted}`);
  console.log(`  Updated    : ${updated} (already had content)`);
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
