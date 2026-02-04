import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/context/ToastContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'We Scout - Strategic Market Intelligence',
  description: 'Transform raw product ideas into board-ready strategic reports using AI-powered web-orchestration.',
  keywords: ['market research', 'AI', 'competitive analysis', 'product strategy'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
