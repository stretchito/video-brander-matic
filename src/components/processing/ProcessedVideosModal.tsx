import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle } from 'lucide-react';

interface ProcessedVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrls: string[];
  processedCount: number;
}

const ProcessedVideosModal = ({ 
  isOpen, 
  onClose, 
  videoUrls,
  processedCount
}: ProcessedVideosModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] w-[95vw] overflow-y-auto max-h-[80vh] fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <DialogHeader>
          <DialogTitle>Processed Videos</DialogTitle>
          <DialogDescription>
            {processedCount > 0 
              ? `${processedCount} video${processedCount > 1 ? 's' : ''} processed and ready to play`
              : 'No videos processed yet'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {videoUrls.map((url, index) => (
            <div 
              key={url} 
              className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg animate-fadeIn"
            >
              <span className="font-medium">Video {index + 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="flex items-center gap-2 min-w-[120px]"
              >
                <PlayCircle className="w-4 h-4" />
                Play Video
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessedVideosModal;