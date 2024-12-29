import React, { useState } from 'react';
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
}

const ProcessingStatus = ({ status, currentAction, progress }: ProcessingStatusProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  // Parse video URLs from currentAction if it's a completed status
  const getVideoUrls = () => {
    if (status === 'completed' && currentAction.includes('http')) {
      // Ensure we're getting the full Cloudinary URL with all transformations
      return currentAction.split(',')
        .map(url => url.trim())
        .filter(url => url.startsWith('https://res.cloudinary.com') && url.endsWith('.mp4'));
    }
    return [];
  };

  const videoUrls = getVideoUrls();
  const hasMultipleVideos = videoUrls.length > 1;

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

        <Card className={`w-full md:w-1/2 ${status === 'completed' ? 'bg-green-100' : ''}`}>
          <CardHeader>
            <CardTitle className="text-sm">Current Action</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {status === 'completed' && videoUrls.length > 0 ? (
                <span className="text-green-600 font-bold">Success!!</span>
              ) : (
                currentAction
              )}
            </p>
            {status === 'completed' && videoUrls.length > 0 && (
              <div className="mt-2">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  View {hasMultipleVideos ? 'Videos' : 'Video'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ProcessedVideosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrls={videoUrls}
      />
    </div>
  );
};

export default ProcessingStatus;