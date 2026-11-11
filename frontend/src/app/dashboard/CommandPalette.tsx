'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, ClipboardList, BookOpen, FileText, Briefcase, Crown,
  LayoutDashboard, GraduationCap, ArrowRight,
} from 'lucide-react';
import styles from './commandPalette.module.css';

interface SubjectOption {
  slug: string;
  name: string;
  mcqs: number;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  subjects: SubjectOption[];
}

interface Item {
  kind: 'action' | 'subject';
  label: string;
  hint: string;
  href: string;
  Icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const ACTIONS: (Omit<Item, 'kind'>)[] = [
  { label: "Today's test", hint: 'Daily Premium Exam', href: '/classroom?tab=test&daily=1', Icon: ClipboardList },
  { label: 'Practice MCQs', hint: 'Topic-wise practice', href: '/classroom?tab=practice', Icon: BookOpen },
  { label: 'Open classroom', hint: 'Study notes and tests', href: '/classroom', Icon: GraduationCap },
  { label: 'Past papers', hint: 'Solved online in the classroom', href: '/past-papers', Icon: FileText },
  { label: 'Jobs', hint: 'PPSC openings to track', href: '/jobs', Icon: Briefcase },
  { label: 'Subscription', hint: 'Plans and billing', href: '/subscription', Icon: Crown },
  { label: 'Dashboard', hint: 'Home', href: '/dashboard', Icon: LayoutDashboard },
];

/* ⌘K command palette (design #8): fuzzy search over actions + subjects,
   keyboard-first, Esc closes. Rendered from the dashboard app header. */
export default function CommandPalette({ open, onClose, subjects }: CommandPaletteProps) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const items = useMemo<Item[]>(() => {
    const query = q.trim().toLowerCase();
    const match = (s: string) => !query || s.toLowerCase().includes(query);
    const actions: Item[] = ACTIONS.filter(
      (a) => match(a.label) || match(a.hint)
    ).map((a) => ({ ...a, kind: 'action' as const }));
    const subs: Item[] = subjects
      .filter((s) => match(s.name))
      .slice(0, 8)
      .map((s) => ({
        kind: 'subject' as const,
        label: s.name,
        hint: `${s.mcqs} MCQs`,
        href: `/classroom?subject=${s.slug}`,
        Icon: BookOpen,
      }));
    return [...actions, ...subs];
  }, [q, subjects]);

  if (!open) return null;

  const go = (item: Item) => {
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = items[active];
      if (item) go(item);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Search and jump">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <Search size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search subjects, tests, jobs…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            aria-label="Search Merit Master"
          />
          <span className={styles.kbd}>ESC</span>
        </div>
        <div className={styles.list}>
          {items.length === 0 ? (
            <p className={styles.empty}>Nothing matches “{q}”.</p>
          ) : (
            items.map((item, i) => (
              <React.Fragment key={item.href}>
                {(i === 0 || items[i - 1].kind !== item.kind) && (
                  <p className={styles.groupLabel}>{item.kind === 'action' ? 'Actions' : 'Subjects'}</p>
                )}
                <button
                  type="button"
                  className={`${styles.item} ${i === active ? styles.itemActive : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                >
                  <span className={styles.itemIcon}>
                    <item.Icon size={17} />
                  </span>
                  <span>
                    <span className={styles.itemLabel}>{item.label}</span>
                    <span className={styles.itemHint}>{item.hint}</span>
                  </span>
                  <ArrowRight size={15} className={styles.itemEnter} />
                </button>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
