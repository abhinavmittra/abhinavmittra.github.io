import type { Metadata, Viewport } from 'next';
import { profile } from '@/content/portfolio';
import './globals.css';

export const metadata: Metadata = {
  title: `${profile.firstName} ${profile.lastName} — The Systems Desk`,
  description: 'Abhinav Mittra, Software Engineer 3 at Cisco. Enterprise applications, integrations, and ongoing agentic AI projects, explored through an interactive engineering desk.'
};

export const viewport: Viewport = { themeColor: '#15191d' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
