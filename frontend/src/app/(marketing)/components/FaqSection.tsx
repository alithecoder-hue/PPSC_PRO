'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ITEMS = [
  {
    q: 'Is Merit Master free to start?',
    a: 'Yes. The Starter plan is free forever — you get topic-wise MCQ practice, 5 mock tests a month and basic tracking. No card required.',
  },
  {
    q: 'Which exams does Merit Master cover?',
    a: 'Primarily PPSC, plus FPSC, NTS, OTS and FIA papers. Every subject is organized topic-wise exactly the way the exams test it.',
  },
  {
    q: 'How do the mock tests work?',
    a: 'Timed, full-length tests built from real past-paper patterns. You get instant scoring, per-question explanations and a breakdown of your weak areas after every attempt.',
  },
  {
    q: 'What do I get with Premium?',
    a: 'Unlimited mock tests, the full 5-year solved past-paper library as downloadable PDFs, advanced analytics, the custom test builder and the study planner.',
  },
  {
    q: 'How do I pay for Premium?',
    a: 'With JazzCash, Easypaisa or bank transfer. After payment you submit your transaction ID on the billing page and our team verifies and activates your Premium access.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Anytime. You keep Premium access until the end of your billing period — no lock-in, no hidden charges.',
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mm-faq">
      {ITEMS.map((item, i) => (
        <div
          key={i}
          className="mm-faq-item"
          data-open={open === i}
        >
          <button
            className="mm-faq-q"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {item.q}
            <ChevronDown size={18} />
          </button>
          {open === i && <p className="mm-faq-a">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
