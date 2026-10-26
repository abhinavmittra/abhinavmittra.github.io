import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';
import { profile } from '@/content/portfolio';
import { sitePath } from '@/lib/sitePath';
import './globals.css';

export const metadata: Metadata = {
  title: `${profile.firstName} ${profile.lastName} — The Systems Desk`,
  description: 'Abhinav Mittra, Software Engineer 3 at Cisco. Enterprise applications, integrations, and ongoing agentic AI projects, explored through an interactive engineering desk.'
};

export const viewport: Viewport = { themeColor: '#15191d' };

const iconVariables = {
  '--icon-external': `url("${sitePath('/icons/box-arrow-up-right.svg')}")`,
  '--icon-youtube': `url("${sitePath('/icons/youtube.svg')}")`,
  '--icon-instagram': `url("${sitePath('/icons/instagram.svg')}")`,
  '--icon-linkedin': `url("${sitePath('/icons/linkedin.svg')}")`,
  '--icon-github': `url("${sitePath('/icons/github.svg')}")`,
  '--icon-whatsapp': `url("${sitePath('/icons/whatsapp.svg')}")`,
  '--icon-envelope': `url("${sitePath('/icons/envelope.svg')}")`,
  '--icon-resume': `url("${sitePath('/icons/file-earmark-text.svg')}")`,
} as CSSProperties;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={iconVariables}>
      <body>{children}</body>
    </html>
  );
}
