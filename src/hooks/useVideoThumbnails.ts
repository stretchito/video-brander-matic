import { useState, useEffect } from 'react';

export const useVideoThumbnails = (videoUrls: string[]) => {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
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

  return thumbnails;
};