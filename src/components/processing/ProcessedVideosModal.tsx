import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Circle, Download, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectedVideos, setSelectedVideos] = React.useState<string[]>([]);

  const handleCheckboxChange = (url: string) => {
    setSelectedVideos(prev => 
      prev.includes(url) 
        ? prev.filter(v => v !== url)
        : [...prev, url]
    );
  };

  const handleDownloadSelected = () => {
    selectedVideos.forEach(url => {
      window.open(url, '_blank');
    });
  };

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
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedVideos.includes(url)}
                  onCheckedChange={() => handleCheckboxChange(url)}
                  className="h-5 w-5"
                />
                <span className="font-medium">Video {index + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(url, '_blank')}
                  className={cn(
                    "rounded-full w-12 h-12 p-0 relative overflow-hidden",
                    "hover:bg-secondary/20 transition-colors"
                  )}
                >
                  <Circle className="w-full h-full absolute" />
                  <PlayCircle className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </Button>
              </div>
            </div>
          ))}
          {selectedVideos.length > 0 && (
            <Button
              onClick={handleDownloadSelected}
              className="w-full flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Selected ({selectedVideos.length})
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessedVideosModal;