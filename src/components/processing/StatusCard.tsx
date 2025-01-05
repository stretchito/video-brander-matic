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
  processingSteps?: string[];
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
  processingSteps = []
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

  return (
    <Card className={`w-full md:w-1/2 ${title === 'Status' ? getStatusColor() : ''} transition-colors duration-300`}>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium mb-2">
          {getDisplayText()}
        </p>
        
        {processingSteps.length > 0 && (
          <ScrollArea className="h-24 rounded-md border p-2 mb-2">
            {processingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-2 py-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm">{step}</span>
              </div>
            ))}
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