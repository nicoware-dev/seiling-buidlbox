import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seiling Auditor - Smart Contract Security Analysis',
  description: 'AI-powered smart contract auditing tool for Sei blockchain',
  icons: '/icon.png'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="sbx-topbar">
          <div className="sbx-topbar__inner">
            <div className="sbx-brand">
              <img src="/icon.png" alt="Seiling Buidlbox" className="sbx-brand__logo" />
              <span className="sbx-brand__name">Seiling Auditor</span>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

