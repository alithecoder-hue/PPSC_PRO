import Link from 'next/link';
import { Check, Play } from 'lucide-react';

// Hero as a live classroom mock (design #3): instead of banner art, the hero
// shows the actual product — a real question from the bank, answered, with
// the instant-feedback state the classroom gives. The question, options and
// explanation are verbatim from the General Knowledge bank
// (backend/prisma/mcq-bank/general-knowledge.json); the counts in the strip
// are the verified ones (16 subjects, 103 Computer Studies notes).
const OPTIONS = [
  { id: 'A', text: 'Asia' },
  { id: 'B', text: 'Africa' },
  { id: 'C', text: 'North America' },
  { id: 'D', text: 'Europe' },
];

export default function HeroQuizCard() {
  return (
    <div className="mm-hero-card" role="img" aria-label="Preview of the Merit Master classroom: a practice question with instant feedback">
      <div className="mm-hero-card-head">
        <span className="mm-hero-card-title">
          <Play size={14} /> Classroom · Practice
        </span>
        <span className="mm-hero-card-pill">General Knowledge</span>
      </div>
      <p className="mm-hero-card-q">Which is the largest continent in the world by area?</p>
      <div className="mm-hero-card-opts">
        {OPTIONS.map((opt) => {
          const isCorrect = opt.id === 'A';
          return (
            <div
              key={opt.id}
              className={`mm-hero-card-opt ${isCorrect ? 'mm-hero-card-opt-ok' : ''}`}
            >
              <span className="mm-hero-card-opt-label">{opt.id}</span>
              <span>{opt.text}</span>
              {isCorrect ? <Check size={15} /> : null}
            </div>
          );
        })}
      </div>
      <p className="mm-hero-card-expl">
        Correct — Asia covers about 44.6 million sq km, nearly 30% of Earth&apos;s total land area.
      </p>
      <div className="mm-hero-card-foot">
        <span>16 subjects · 103 study notes</span>
        <Link href="#mini-quiz">Try 5 free questions ↓</Link>
      </div>
    </div>
  );
}
