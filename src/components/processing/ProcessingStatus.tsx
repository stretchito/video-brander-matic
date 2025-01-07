import React, { useState, useEffect } from 'react';
import ProcessingProgressSection from './status/ProcessingProgressSection';
import ProcessingStatusCards from './status/ProcessingStatusCards';
import ProcessedVideosModal from './ProcessedVideosModal';
import { ProcessingStatus as ProcessingStatusType } from '@/types/videoProcessing';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
  currentAction: string;
  progress: number;
  totalVideos?: number;
  processedCount?: number;
  totalSteps?: number;
  completedSteps?: number;
  processingSteps?: string[];
}

const ProcessingStatus = ({ 
  status, 
  currentAction, 
  progress,
  totalVideos = 0,
  processedCount = 0,
  totalSteps = 0,
  completedSteps = 0,
  processingSteps = []
}: ProcessingStatusProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  
  useEffect(() => {
    if (currentAction.startsWith('https://') && currentAction.endsWith('.mp4')) {
      setVideoUrls(prev => [...prev, currentAction]);
      setIsModalOpen(true);
    }
  }, [currentAction]);

  useEffect(() => {
    if (status === 'waiting') {
      setVideoUrls([]);
      setIsModalOpen(false);
    }
  }, [status]);

  const hasProcessedVideos = videoUrls.length > 0;
  const allVideosProcessed = processedCount === totalVideos && totalVideos > 0;
  const showSuccessMessage = status === 'completed' && allVideosProcessed;

  return (
    <div className="flex flex-col gap-4">
      <ProcessingProgressSection
        status={status}
        progress={progress}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
      />
      
      <ProcessingStatusCards
        status={status}
        currentAction={currentAction}
        hasProcessedVideos={hasProcessedVideos}
        processedCount={processedCount}
        totalVideos={totalVideos}
        onViewVideos={() => setIsModalOpen(true)}
        showSuccessMessage={showSuccessMessage}
        processingSteps={processingSteps}
      />

      <ProcessedVideosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrls={videoUrls}
        processedCount={processedCount}
      />
    </div>
  );
};

export default ProcessingStatus;