import type { Metadata, Viewport } from 'next';
import { profile } from '@/content/portfolio';
import './globals.css';

export const metadata: Metadata = {
  title: `${profile.firstName} ${profile.lastName} — The Systems Desk`,
  description: 'An interactive 3D workspace of enterprise software, integrations, and agentic AI by Abhinav Mittra.'
};

export const viewport: Viewport = { themeColor: '#141a17' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
