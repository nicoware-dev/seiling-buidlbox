'use client';

import { useEffect, useState } from 'react';

type ThemeChoice = 'light' | 'dark' | 'system';

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === 'system') {
    root.removeAttribute('data-theme');
    return;
  }
  root.setAttribute('data-theme', choice);
}

export default function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>('system');

  useEffect(() => {
    const saved = (localStorage.getItem('sbx-theme') as ThemeChoice) || 'system';
    setChoice(saved);
    applyTheme(saved);
  }, []);

  const cycle = () => {
    const next: ThemeChoice = choice === 'system' ? 'light' : choice === 'light' ? 'dark' : 'system';
    setChoice(next);
    localStorage.setItem('sbx-theme', next);
    applyTheme(next);
  };

  const label = choice === 'system' ? 'Auto' : choice === 'light' ? 'Light' : 'Dark';
  const icon = choice === 'dark' ? '🌙' : choice === 'light' ? '☀️' : '🖥️';

  return (
    <button onClick={cycle} className="btn btn-outline" aria-label="Toggle theme">
      <span style={{ marginRight: 6 }}>{icon}</span>{label}
    </button>
  );
}


