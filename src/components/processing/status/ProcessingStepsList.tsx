import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2 } from 'lucide-react';

interface ProcessingStepsListProps {
  steps: string[];
}

const ProcessingStepsList = ({ steps }: ProcessingStepsListProps) => {
  if (steps.length === 0) return null;

  return (
    <ScrollArea className="h-24 rounded-md border p-2 mb-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2 py-1">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm">{step}</span>
        </div>
      ))}
    </ScrollArea>
  );
};

export default ProcessingStepsList;