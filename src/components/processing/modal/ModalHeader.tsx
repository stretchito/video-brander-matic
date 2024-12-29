import React from 'react';
import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ModalHeaderProps {
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
}

const ModalHeader = ({ status, progress }: ModalHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle>Processed Videos</DialogTitle>
      <Progress 
        value={progress} 
        className="w-full mt-2"
        indicatorClassName={status === 'completed' ? 'bg-green-500' : 'bg-primary'}
      />
    </DialogHeader>
  );
};

export default ModalHeader;