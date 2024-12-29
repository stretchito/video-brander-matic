import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StatusCardProps {
  title: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  currentAction: string;
  hasProcessedVideos: boolean;
  processedCount: number;
  totalVideos: number;
  onViewVideos: () => void;
  showSuccessMessage: boolean;
  steps?: string[];
  completedSteps?: number;
  totalSteps?: number;
}

const StatusCard = ({
  title,
  status,
  currentAction,
  hasProcessedVideos,
  processedCount,
  totalVideos,
  onViewVideos,
  showSuccessMessage,
  steps = [],
  completedSteps = 0,
  totalSteps = 0
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
    
    if (currentAction.startsWith('https://')) {
      return status === 'completed' 
        ? 'Processing complete!' 
        : 'Processing video...';
    }
    return currentAction;
  };

  const formatStepName = (step: string) => {
    return step
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
        
        {steps.length > 0 && (
          <ScrollArea className="h-32 mt-4">
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-2 text-sm"
                >
                  {index < completedSteps && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  <span className={index < completedSteps ? 'text-green-700' : ''}>
                    {formatStepName(step)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

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