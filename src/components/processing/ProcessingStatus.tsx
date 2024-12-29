import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import VideoPlayerModal from './VideoPlayerModal';
import { PlayCircle } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'waiting' | 'processing' | 'completed' | 'error';
  currentAction: string;
  progress: number;
}

const ProcessingStatus = ({ status, currentAction, progress }: ProcessingStatusProps) => {
  const [openModals, setOpenModals] = useState<{ [key: string]: boolean }>({});
  
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
      return currentAction.split(',').map(url => url.trim());
    }
    return [];
  };

  const videoUrls = getVideoUrls();
  const hasMultipleVideos = videoUrls.length > 1;

  const handleOpenModal = (url: string) => {
    setOpenModals(prev => ({ ...prev, [url]: true }));
  };

  const handleCloseModal = (url: string) => {
    setOpenModals(prev => ({ ...prev, [url]: false }));
  };

  const handleOpenAllModals = () => {
    const newModals = videoUrls.reduce((acc, url) => {
      acc[url] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    setOpenModals(newModals);
  };

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
              {status === 'completed' && currentAction.includes('http') ? (
                <span className="text-green-600 font-bold">Success!!</span>
              ) : (
                currentAction
              )}
            </p>
            {status === 'completed' && videoUrls.length > 0 && (
              <div className="mt-2">
                <Button
                  onClick={handleOpenAllModals}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Play {hasMultipleVideos ? 'Videos' : 'Video'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videoUrls.map((url, index) => (
          <VideoPlayerModal
            key={url}
            isOpen={!!openModals[url]}
            onClose={() => handleCloseModal(url)}
            videoUrl={url}
            title={`Processed Video ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProcessingStatus;