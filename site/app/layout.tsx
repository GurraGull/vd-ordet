import type { Metadata } from 'next';
import { Newsreader, Libre_Franklin, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const newsreader = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-newsreader' });
const franklin = Libre_Franklin({ subsets: ['latin'], variable: '--font-franklin' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'VD-ordet 2025–2026',
  description: 'En berättelse i tre akter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${newsreader.variable} ${franklin.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
