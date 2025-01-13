import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';

interface StatusCardProps {
  title: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  currentAction: string;
  hasProcessedVideos: boolean;
  processedCount: number;
  totalVideos: number;
  onViewVideos: () => void;
  showSuccessMessage: boolean;
}

const StatusCard = ({
  title,
  status,
  currentAction,
  hasProcessedVideos,
  processedCount,
  totalVideos,
  onViewVideos,
  showSuccessMessage
}: StatusCardProps) => {
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

  const getDisplayText = () => {
    if (showSuccessMessage) return 'Success!!';
    if (title === 'Status') return status;
    
    // For Current Action, show appropriate status message
    if (currentAction.startsWith('https://')) {
      return status === 'completed' 
        ? 'Processing complete!' 
        : 'Processing video...';
    }
    return currentAction;
  };

  return (
    <Card className={`w-full md:w-1/2 ${title === 'Status' ? getStatusColor() : ''} transition-colors duration-300`}>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium">
          {getDisplayText()}
        </p>
        {hasProcessedVideos && title !== 'Status' && (
          <div className="mt-2">
            <Button
              onClick={onViewVideos}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span className="truncate">View Videos ({processedCount}/{totalVideos})</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;