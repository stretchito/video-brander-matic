import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  status: 'waiting' | 'processing' | 'completed' | 'error';
  currentAction: string;
  progress: number;
}

const ProcessingStatus = ({ status, currentAction, progress }: ProcessingStatusProps) => {
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
    if (progress === 100 && status !== 'error') return 'bg-green-500';
    if (status === 'error') return 'bg-red-500';
    return 'bg-primary';
  };

  return (
    <div className="flex flex-col gap-4">
      <Progress 
        value={progress} 
        className="w-full"
        indicatorClassName={cn(getProgressColor())}
      />
      
      <div className="flex justify-center gap-4">
        <Card className={`w-1/2 ${getStatusColor()} transition-colors duration-300`}>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium capitalize">{status}</p>
          </CardContent>
        </Card>

        <Card className={`w-1/2 ${status === 'completed' ? 'bg-green-100' : ''}`}>
          <CardHeader>
            <CardTitle className="text-sm">Current Action</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{currentAction}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessingStatus;