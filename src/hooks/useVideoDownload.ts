import { useState } from 'react';
import JSZip from 'jszip';

export const useVideoDownload = () => {
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStatus, setCompressionStatus] = useState<'idle' | 'compressing' | 'completed'>('idle');

  const downloadSingleVideo = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `processed_video_${Date.now()}.mp4`;
    link.click();
  };

  const downloadMultipleVideos = async (selectedVideos: string[]) => {
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

  const handleDownload = async (selectedVideos: string[]) => {
    if (selectedVideos.length === 1) {
      await downloadSingleVideo(selectedVideos[0]);
      return;
    }
    await downloadMultipleVideos(selectedVideos);
  };

  return {
    compressionProgress,
    compressionStatus,
    handleDownload
  };
};