import React, { useEffect } from 'react';

interface ThumbnailGeneratorProps {
  videoUrls: string[];
  thumbnails: Record<string, string>;
  setThumbnails: (thumbnails: Record<string, string>) => void;
}

const ThumbnailGenerator = ({ videoUrls, thumbnails, setThumbnails }: ThumbnailGeneratorProps) => {
  useEffect(() => {
    // Generate thumbnails for each video
    const uniqueUrls = Array.from(new Set(videoUrls));
    uniqueUrls.forEach(url => {
      if (!thumbnails[url]) {
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
      }
    });
  }, [videoUrls, thumbnails, setThumbnails]);

  return null; // This is a logic-only component
};

export default ThumbnailGenerator;