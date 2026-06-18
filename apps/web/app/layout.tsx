import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentMirror — one AGENTS.md, synced to every AI tool',
  description:
    'Keep one canonical AGENTS.md and generate CLAUDE.md, Cursor, Copilot, Gemini, Windsurf, and Cline mirrors — drift-checked and lean. Open-source CLI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
