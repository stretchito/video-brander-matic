import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import VideoItem from './VideoItem';
import DownloadSection from './DownloadSection';
import { useVideoThumbnails } from '@/hooks/useVideoThumbnails';
import { useVideoDownload } from '@/hooks/useVideoDownload';

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
  const thumbnails = useVideoThumbnails(videoUrls);
  const { compressionProgress, compressionStatus, handleDownload } = useVideoDownload();

  // Reset selected videos when modal opens/closes or video list changes
  useEffect(() => {
    setSelectedVideos([]);
  }, [isOpen, videoUrls]);

  const handleCheckboxChange = (url: string) => {
    setSelectedVideos(prev => 
      prev.includes(url) 
        ? prev.filter(v => v !== url)
        : [...prev, url]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedVideos(checked ? [...videoUrls] : []);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] w-[95vw] overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Processed Videos</DialogTitle>
          <DialogDescription>
            {processedCount > 0 
              ? `${processedCount} video${processedCount > 1 ? 's' : ''} processed and ready to play`
              : 'No videos processed yet'}
          </DialogDescription>
        </DialogHeader>
        {videoUrls.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              id="select-all"
              checked={selectedVideos.length === videoUrls.length}
              onCheckedChange={handleSelectAll}
              className="h-5 w-5"
            />
            <label 
              htmlFor="select-all" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Select All
            </label>
          </div>
        )}
        <div className="space-y-4">
          {videoUrls.map((url, index) => (
            <VideoItem
              key={url}
              url={url}
              index={index}
              isSelected={selectedVideos.includes(url)}
              thumbnail={thumbnails[url]}
              onCheckboxChange={handleCheckboxChange}
            />
          ))}
          <DownloadSection
            selectedCount={selectedVideos.length}
            compressionStatus={compressionStatus}
            compressionProgress={compressionProgress}
            onDownload={() => handleDownload(selectedVideos)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessedVideosModal;