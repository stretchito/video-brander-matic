import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import VideoList from './modal/VideoList';
import DownloadSection from './modal/DownloadSection';
import ThumbnailGenerator from './modal/ThumbnailGenerator';
import ModalHeader from './modal/ModalHeader';

interface ProcessedVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrls: string[];
  processedCount: number;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
}

const ProcessedVideosModal = ({ 
  isOpen, 
  onClose, 
  videoUrls,
  processedCount,
  status,
  progress
}: ProcessedVideosModalProps) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState<'idle' | 'compressing' | 'completed'>('idle');

  // Reset selections when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVideos([]);
      setCompressionProgress(0);
      setCompressionStatus('idle');
    }
  }, [isOpen]);

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
        <ModalHeader status={status} progress={progress} />
        <ThumbnailGenerator
          videoUrls={videoUrls}
          thumbnails={thumbnails}
          setThumbnails={setThumbnails}
        />
        <div className="space-y-4">
          <VideoList
            videoUrls={videoUrls}
            thumbnails={thumbnails}
            selectedVideos={selectedVideos}
            onSelect={handleCheckboxChange}
          />
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