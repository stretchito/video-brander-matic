import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
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
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState<'idle' | 'compressing' | 'completed'>('idle');

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

  const handleSelectAll = (checked: boolean) => {
    setSelectedVideos(checked ? [...videoUrls] : []);
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

    setCompressionStatus('compressing');
    setCompressionProgress(10);
    const zip = new JSZip();
    
    const totalFiles = selectedVideos.length;
    let completedFiles = 0;

    const downloads = selectedVideos.map(async (url, index) => {
      const response = await fetch(url);
      const blob = await response.blob();
      zip.file(`processed_video_${index + 1}.mp4`, blob);
      completedFiles++;
      setCompressionProgress(Math.round((completedFiles / totalFiles) * 80) + 10);
    });

    await Promise.all(downloads);
    setCompressionProgress(90);

    const content = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6
      }
    });

    setCompressionProgress(100);
    setCompressionStatus('completed');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `processed_videos_${Date.now()}.zip`;
    link.click();
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
              checked={selectedVideos.length === videoUrls.length}
              onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
              className="h-5 w-5"
            />
            <span className="text-sm text-muted-foreground">Select All</span>
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
            onDownload={handleDownloadSelected}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessedVideosModal;