
import React, { useState, useEffect } from 'react';
import ProcessingProgressBar from './ProcessingProgressBar';
import StatusCard from './StatusCard';
import ProcessedVideosModal from './ProcessedVideosModal';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps {
  status: 'waiting' | 'processing' | 'completed' | 'error';
  currentAction: string;
  progress: number;
  totalVideos?: number;
  processedCount?: number;
  logoProgress?: number;
  videoProgress?: number;
  processingProgress?: number;
}

const ProcessingStatus = ({ 
  status, 
  currentAction, 
  progress,
  totalVideos = 0,
  processedCount = 0,
  logoProgress = 0,
  videoProgress = 0,
  processingProgress = 0
}: ProcessingStatusProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  
  useEffect(() => {
    if (currentAction.startsWith('https://res.cloudinary.com') && currentAction.endsWith('.mp4')) {
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

  const getProgressColor = (value: number) => {
    if (value === 0) return 'bg-gray-200';
    if (value === 100) return 'bg-green-500';
    return 'bg-blue-400';
  };

  return (
    <div className="flex flex-col gap-4">
      <ProcessingProgressBar status={status} progress={progress} />
      
      {status === 'processing' && (
        <div className="space-y-3 p-3 border rounded-md bg-secondary/5">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Logo Upload</span>
              <span>{logoProgress}%</span>
            </div>
            <Progress 
              value={logoProgress} 
              className="w-full h-2" 
              indicatorClassName={getProgressColor(logoProgress)}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Video Upload</span>
              <span>{videoProgress}%</span>
            </div>
            <Progress 
              value={videoProgress} 
              className="w-full h-2" 
              indicatorClassName={getProgressColor(videoProgress)}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Processing</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress 
              value={processingProgress} 
              className="w-full h-2" 
              indicatorClassName={getProgressColor(processingProgress)}
            />
          </div>
        </div>
      )}
      
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
