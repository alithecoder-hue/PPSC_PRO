# MCQ Bank — format spec

Each file in this directory is a JSON array of questions for one subject.
File name: `<subject-slug>.json` (e.g. `pakistan-studies.json`).

## Question object

```json
{
  "subject": "Pakistan Studies",
  "topic": "Geography of Pakistan",
  "subtopic": "Major Rivers and Water System (Indus Basin)",
  "question": "Which is the longest river of Pakistan?",
  "options": ["River Jhelum", "River Indus", "River Chenab", "River Ravi"],
  "correct": 1,
  "explanation": "The Indus (~3,180 km) is the longest river of Pakistan.",
  "difficulty": "easy"
}
```

## Rules (strict)

- `subject`, `topic`, `subtopic` MUST match the names in `src/seed.ts` exactly
  (case-sensitive). The importer resolves them to DB ids by name; a typo
  means the question is skipped and logged.
- `options`: exactly 4 strings, each non-empty, max 200 chars.
- `correct`: integer 0–3, the index of the right answer in `options`.
- `difficulty`: one of `easy`, `medium`, `hard`.
- `explanation`: 1–2 sentences. Required — no empty explanations.
- `question`: single clear sentence ending with `?` (or `:` for completion-style
  questions, e.g. "The Lahore Resolution was passed on:"). No "All of the above" /
  "None of the above" options. Distractors must be plausible (same category
  as the answer, not joke options).
- No duplicate questions within a file. Facts must be correct — a wrong
  answer destroys user trust. When unsure, prefer well-established facts.
- Urdu subject: questions/options may be in Urdu script (UTF-8).

## Importing

```bash
cd backend
npx prisma generate
# dry run (validates every file, no DB writes):
npx ts-node prisma/seed-mcqs.ts --dry-run
# real import (idempotent — skips questions already in DB):
npx ts-node prisma/seed-mcqs.ts
```
