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
}

const ProcessingStatus = ({ 
  status, 
  currentAction, 
  progress,
  totalVideos = 0,
  processedCount = 0
}: ProcessingStatusProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  
  useEffect(() => {
    // Only add URLs that are actually Cloudinary video URLs
    if (currentAction.startsWith('https://res.cloudinary.com') && 
        (currentAction.endsWith('.mp4') || 
         currentAction.endsWith('.mov') || 
         currentAction.endsWith('.avi') || 
         currentAction.endsWith('.webm'))) {
      setVideoUrls(prev => [...new Set([...prev, currentAction])]);
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

  // Ensure we're displaying the correct count
  const displayCount = Math.min(processedCount, totalVideos);
  const displayTotal = totalVideos > 0 ? totalVideos : videoUrls.length;

  return (
    <div className="flex flex-col gap-4">
      <ProcessingProgressBar status={status} progress={progress} />
      
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <StatusCard
          title="Status"
          status={status}
          currentAction={currentAction}
          hasProcessedVideos={hasProcessedVideos}
          processedCount={displayCount}
          totalVideos={displayTotal}
          onViewVideos={() => setIsModalOpen(true)}
          showSuccessMessage={false}
        />

        <StatusCard
          title="Current Action"
          status={status}
          currentAction={currentAction}
          hasProcessedVideos={hasProcessedVideos}
          processedCount={displayCount}
          totalVideos={displayTotal}
          onViewVideos={() => setIsModalOpen(true)}
          showSuccessMessage={showSuccessMessage}
        />
      </div>

      <ProcessedVideosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrls={videoUrls}
        processedCount={displayCount}
        status={status}
        progress={progress}
      />
    </div>
  );
};

export default ProcessingStatus;