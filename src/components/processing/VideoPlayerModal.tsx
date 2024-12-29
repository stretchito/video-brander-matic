import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoPlayerModal = ({ isOpen, onClose, videoUrl }: VideoPlayerModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Processed Video</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          <video 
            controls 
            className="w-full h-full rounded-lg"
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;