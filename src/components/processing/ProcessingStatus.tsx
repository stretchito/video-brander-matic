import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
        return 'bg-[#F2FCE2]';
      case 'error':
        return 'bg-[#ea384c]';
      default:
        return 'bg-[#33C3F0]';
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <Progress value={progress} className="w-full" />
      
      <div className="flex justify-center gap-4">
        <Card className={`w-1/2 ${getStatusColor()} transition-colors duration-300`}>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium capitalize">{status}</p>
          </CardContent>
        </Card>

        <Card className="w-1/2">
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