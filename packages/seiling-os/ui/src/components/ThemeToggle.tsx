'use client';

import { useEffect, useState } from 'react';

type ThemeChoice = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>('system');

  useEffect(() => {
    const saved = (localStorage.getItem('sbx-theme') as ThemeChoice) || 'system';
    setChoice(saved);
  }, []);

  const cycle = () => {
    const next: ThemeChoice = choice === 'system' ? 'light' : choice === 'light' ? 'dark' : 'system';
    setChoice(next);
    localStorage.setItem('sbx-theme', next);
    if (next === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', next);
    }
  };

  const label = choice === 'system' ? 'Auto' : choice === 'light' ? 'Light' : 'Dark';

  return (
    <button onClick={cycle} className="sbx-btn sbx-btn-outline" aria-label="Toggle theme">
      {label}
    </button>
  );
}


