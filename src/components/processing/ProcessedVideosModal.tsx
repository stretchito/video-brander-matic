import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';

interface ProcessedVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrls: string[];
}

const ProcessedVideosModal = ({ isOpen, onClose, videoUrls }: ProcessedVideosModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Processed Videos</DialogTitle>
          <DialogDescription>
            Click the buttons below to open your processed videos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {videoUrls.map((url, index) => (
            <div key={url} className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
              <span className="font-medium">Video {index + 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Video
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessedVideosModal;