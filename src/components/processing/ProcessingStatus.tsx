import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProcessedVideosModal from './ProcessedVideosModal';
import { PlayCircle } from 'lucide-react';

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
  
  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return 'bg-[#33C3F0]';
      case 'processing':
        return 'bg-[#FEF7CD]';
      case 'completed':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      default:
        return 'bg-[#33C3F0]';
    }
  };

  const getProgressColor = () => {
    if (status === 'waiting') return 'bg-transparent';
    if (progress === 100 && status === 'completed') return 'bg-green-500';
    if (status === 'error') return 'bg-red-500';
    return 'bg-[#33C3F0]';
  };

  useEffect(() => {
    if (status === 'completed' && currentAction.includes('http')) {
      const urls = currentAction.split(',')
        .map(url => url.trim())
        .filter(url => url.startsWith('https://res.cloudinary.com') && url.endsWith('.mp4'));
      setVideoUrls(urls);
    }
  }, [status, currentAction]);

  const hasProcessedVideos = videoUrls.length > 0;
  const allVideosProcessed = processedCount === totalVideos && totalVideos > 0;
  const showSuccessMessage = status === 'completed' && allVideosProcessed;

  return (
    <div className="flex flex-col gap-4">
      <Progress 
        value={status === 'waiting' ? 0 : progress} 
        className={cn(
          "w-full",
          status === 'waiting' ? 'opacity-50' : 'opacity-100'
        )}
        indicatorClassName={cn(getProgressColor())}
      />
      
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <Card className={`w-full md:w-1/2 ${getStatusColor()} transition-colors duration-300`}>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium capitalize">{status}</p>
          </CardContent>
        </Card>

        <Card className={`w-full md:w-1/2 ${showSuccessMessage ? 'bg-green-100' : ''}`}>
          <CardHeader>
            <CardTitle className="text-sm">Current Action</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {showSuccessMessage ? (
                <span className="text-green-600 font-bold">Success!!</span>
              ) : (
                currentAction
              )}
            </p>
            {hasProcessedVideos && (
              <div className="mt-2">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  View Processed Videos ({processedCount}/{totalVideos})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {hasProcessedVideos && (
        <ProcessedVideosModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoUrls={videoUrls}
          processedCount={processedCount}
        />
      )}
    </div>
  );
};

export default ProcessingStatus;