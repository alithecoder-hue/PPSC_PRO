'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, RotateCcw } from 'lucide-react';
import { API_BASE } from '@/lib/api';

// Landing mini-quiz (design #2): five REAL questions from the bank, playable
// before any email field. The browser never sees the answer key — the
// questions arrive without `correct`, and scoring happens server-side.
type QuizMcq = {
  id: number;
  text: string;
  options: { id: string; text: string }[];
  subject: string;
};

type GradeResult = {
  mcqId: number;
  correct: string | null;
  yourAnswer: string;
  explanation: string;
};

export default function MiniQuiz() {
  const [mcqs, setMcqs] = useState<QuizMcq[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState('');
  const [result, setResult] = useState<{ score: number; total: number; results: GradeResult[] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setSlow(false);
    setLoadError('');
    setResult(null);
    setAnswers({});
    setIndex(0);
    try {
      const res = await fetch(`${API_BASE}/api/public/mini-quiz`);
      if (!res.ok) throw new Error('load failed');
      const data = await res.json();
      setMcqs(Array.isArray(data.mcqs) ? data.mcqs : []);
    } catch {
      setLoadError('Could not load the quiz right now — the test service may be waking up. Please try again in a minute.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The quiz server sleeps when idle and can take up to a minute to wake.
  // After 6s of waiting, say so — a bare "Loading…" that long reads as broken.
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, [loading]);

  const current = mcqs[index];
  const answered = current ? answers[current.id] : undefined;

  const submit = async () => {
    setGrading(true);
    setGradeError('');
    try {
      const res = await fetch(`${API_BASE}/api/public/mini-quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: mcqs.map((m) => ({ mcqId: m.id, selectedOption: answers[m.id] || null })),
        }),
      });
      if (!res.ok) throw new Error('grade failed');
      setResult(await res.json());
    } catch {
      setGradeError('Could not grade that round — please try again.');
    } finally {
      setGrading(false);
    }
  };

  return (
    <section className="mm-section mm-quiz" id="mini-quiz" aria-label="Try five free questions">
      <div className="mm-container">
        <div className="mm-center">
          <span className="mm-eyebrow">Try it before you sign up</span>
          <h2 className="mm-h2">Five real questions. No email needed.</h2>
          <p className="mm-lead">
            These are actual questions from the question bank — the same ones
            you will practise inside the classroom.
          </p>
        </div>

        <div className="mm-quiz-card">
          {loading ? (
            <p className="mm-quiz-status">
              Loading 5 real questions…
              {slow ? (
                <>
                  <br />
                  Still waking up the question server — it can take up to a minute after a quiet spell. Please wait, it is coming.
                </>
              ) : null}
            </p>
          ) : loadError ? (
            <div className="mm-quiz-status">
              <p>{loadError}</p>
              <button className="mm-btn mm-btn-accent" onClick={load}>Try again</button>
            </div>
          ) : result ? (
            <div>
              <h3 className="mm-quiz-score">
                You scored {result.score} out of {result.total}
              </h3>
              <p className="mm-quiz-score-sub">
                {result.score === result.total
                  ? 'Perfect — the classroom has 1,266 more where these came from.'
                  : result.score >= 3
                    ? 'Solid start — the classroom will close the gaps.'
                    : 'A good baseline — this is exactly what the classroom is for.'}
              </p>
              <div className="mm-quiz-results">
                {mcqs.map((m) => {
                  const r = result.results.find((x) => x.mcqId === m.id);
                  const ok = r && r.yourAnswer === r.correct;
                  return (
                    <div key={m.id} className="mm-quiz-result">
                      <div className="mm-quiz-result-head">
                        {ok ? <Check size={16} color="#16a34a" /> : <X size={16} color="#dc2626" />}
                        <strong>{m.text}</strong>
                      </div>
                      <p>
                        Your answer: {r?.yourAnswer || '—'}
                        {r?.correct ? ` · Correct answer: ${r.correct}` : ''}
                      </p>
                      {r?.explanation ? <p className="mm-quiz-expl">{r.explanation}</p> : null}
                    </div>
                  );
                })}
              </div>
              <div className="mm-quiz-actions">
                <Link href="/signup" className="mm-btn mm-btn-accent mm-btn-lg">
                  Create free account <ArrowRight size={17} />
                </Link>
                <button className="mm-btn mm-btn-ghost" onClick={load}>
                  <RotateCcw size={16} /> Try 5 more
                </button>
              </div>
            </div>
          ) : current ? (
            <div>
              <div className="mm-quiz-meta">
                <span className="mm-quiz-pill">{current.subject}</span>
                <span>
                  Question {index + 1} of {mcqs.length}
                </span>
              </div>
              <div className="mm-quiz-progress" aria-hidden="true">
                <span style={{ width: `${((index + (answered ? 1 : 0)) / mcqs.length) * 100}%` }} />
              </div>
              <h3 className="mm-quiz-q">{current.text}</h3>
              <div className="mm-quiz-options">
                {current.options.map((opt) => (
                  <button
                    key={opt.id}
                    className={`mm-quiz-opt ${answered === opt.id ? 'mm-quiz-opt-sel' : ''}`}
                    onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: opt.id }))}
                  >
                    <span className="mm-quiz-opt-label">{opt.id}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
              {gradeError ? <p className="mm-quiz-error">{gradeError}</p> : null}
              <div className="mm-quiz-actions">
                {index > 0 ? (
                  <button className="mm-btn mm-btn-ghost" onClick={() => setIndex(index - 1)}>
                    Previous
                  </button>
                ) : null}
                {index < mcqs.length - 1 ? (
                  <button
                    className="mm-btn mm-btn-accent"
                    disabled={!answered}
                    onClick={() => setIndex(index + 1)}
                  >
                    Next question
                  </button>
                ) : (
                  <button
                    className="mm-btn mm-btn-accent"
                    disabled={!answered || grading}
                    onClick={submit}
                  >
                    {grading ? 'Grading…' : 'See my score'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="mm-quiz-status">No questions came back — please try again in a minute.</p>
          )}
        </div>
      </div>
    </section>
  );
}
