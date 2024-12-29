import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
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
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate thumbnails for each video
    videoUrls.forEach(url => {
      const video = document.createElement('video');
      video.crossOrigin = "anonymous";
      video.src = url;
      
      video.addEventListener('loadeddata', () => {
        video.currentTime = 1; // Seek to 1 second
      });

      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg');
        setThumbnails(prev => ({ ...prev, [url]: thumbnail }));
      });
    });
  }, [videoUrls]);

  const handleCheckboxChange = (url: string) => {
    setSelectedVideos(prev => 
      prev.includes(url) 
        ? prev.filter(v => v !== url)
        : [...prev, url]
    );
  };

  const downloadSingleVideo = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `processed_video_${Date.now()}.mp4`;
    link.click();
  };

  const handleDownloadSelected = async () => {
    if (selectedVideos.length === 1) {
      await downloadSingleVideo(selectedVideos[0]);
      return;
    }

    const zip = new JSZip();
    
    // Add each selected video to the zip
    const downloads = selectedVideos.map(async (url, index) => {
      const response = await fetch(url);
      const blob = await response.blob();
      zip.file(`processed_video_${index + 1}.mp4`, blob);
    });

    await Promise.all(downloads);

    // Generate and download zip file
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `processed_videos_${Date.now()}.zip`;
    link.click();
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
                  {thumbnails[url] ? (
                    <img 
                      src={thumbnails[url]} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <>
                      <Circle className="w-full h-full absolute" />
                      <PlayCircle className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </>
                  )}
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