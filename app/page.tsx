import type { Metadata } from 'next';
import LandingPageClient from '@/components/LandingPageClient';

export const metadata: Metadata = {
  title: 'We Scout - Scout Markets. Dominate Niches.',
  description: 'Transform raw product ideas into board-ready strategic reports. AI-powered web-orchestration to find rivals, uncover pain points, and track momentum.',
};

export default function HomePage() {
  return <LandingPageClient />;
}
