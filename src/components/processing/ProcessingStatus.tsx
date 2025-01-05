import React, { useState, useEffect } from 'react';
import ProcessingProgressBar from './ProcessingProgressBar';
import StatusCard from './StatusCard';
import ProcessedVideosModal from './ProcessedVideosModal';

interface ProcessingStatusProps {
  status: 'waiting' | 'processing' | 'completed' | 'error';
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

  // Calculate overall progress including steps
  const calculatedProgress = totalSteps > 0 
    ? Math.round((completedSteps / totalSteps) * 100)
    : progress;

  return (
    <div className="flex flex-col gap-4">
      <ProcessingProgressBar 
        status={status} 
        progress={calculatedProgress} 
      />
      
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <StatusCard
          title="Status"
          status={status}
          currentAction={currentAction}
          hasProcessedVideos={hasProcessedVideos}
          processedCount={processedCount}
          totalVideos={totalVideos}
          onViewVideos={() => setIsModalOpen(true)}
          showSuccessMessage={false}
          processingSteps={processingSteps}
        />

        <StatusCard
          title="Current Action"
          status={status}
          currentAction={currentAction}
          hasProcessedVideos={hasProcessedVideos}
          processedCount={processedCount}
          totalVideos={totalVideos}
          onViewVideos={() => setIsModalOpen(true)}
          showSuccessMessage={showSuccessMessage}
          processingSteps={processingSteps}
        />
      </div>

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