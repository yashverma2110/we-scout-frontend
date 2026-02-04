'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflow } from '@/hooks/useWorkflow';
import ResearchCanvas from '@/components/ResearchCanvas';

const ResearchCanvasClient: React.FC = () => {
  const router = useRouter();
  const workflowState = useWorkflow();

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <ResearchCanvas
      {...workflowState}
      onBack={handleBackToHome}
    />
  );
};

export default ResearchCanvasClient;
