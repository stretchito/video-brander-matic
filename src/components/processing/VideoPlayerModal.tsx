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
  title: string;
}

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title }: VideoPlayerModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-fit">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full max-w-full overflow-hidden rounded-lg">
          <video 
            controls 
            controlsList="nodownload" 
            className="max-h-[80vh] w-auto mx-auto"
            key={videoUrl} // Add key to force video reload when URL changes
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;