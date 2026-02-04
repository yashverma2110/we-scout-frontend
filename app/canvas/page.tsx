import type { Metadata } from 'next';
import ResearchCanvasClient from '@/components/ResearchCanvasClient';

export const metadata: Metadata = {
  title: 'Research Canvas - We Scout',
  description: 'Strategic market intelligence canvas for deep dive research.',
};

export default function CanvasPage() {
  return <ResearchCanvasClient />;
}
