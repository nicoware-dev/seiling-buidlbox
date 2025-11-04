import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Seiling Captain - Buidlbox v2 Control Plane',
  description:
    'Control plane for managing Seiling Buidlbox v2 services, environment configuration, and health monitoring',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Inline script to avoid theme flash: read saved choice and apply early
  const themeInit = `
    (function(){
      try {
        var saved = localStorage.getItem('sbx-theme');
        if (saved === 'light' || saved === 'dark') {
          document.documentElement.setAttribute('data-theme', saved);
        }
      } catch(e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <header className="app-header">
          <div className="header-inner">
            <Link href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="Seiling Buidlbox" width="28" height="28" />
              <span className="brand-title">Seiling Captain</span>
            </Link>
            <nav className="nav">
              <Link href="/services" className="btn btn-outline">Services</Link>
              <Link href="/env" className="btn btn-outline">Env</Link>
              <Link href="/logs?service=openwebui" className="btn btn-outline">Logs</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
        <footer className="footer">
          <div className="footer-inner">
            © {new Date().getFullYear()} Seiling Buidlbox • Built with Next.js
          </div>
        </footer>
      </body>
    </html>
  );
}


