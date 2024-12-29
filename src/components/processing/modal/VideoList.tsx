import React from 'react';
import VideoItem from './VideoItem';

interface VideoListProps {
  videoUrls: string[];
  thumbnails: Record<string, string>;
  selectedVideos: string[];
  onSelect: (url: string) => void;
}

const VideoList = ({ videoUrls, thumbnails, selectedVideos, onSelect }: VideoListProps) => {
  // Remove duplicate URLs
  const uniqueVideoUrls = Array.from(new Set(videoUrls));

  return (
    <div className="space-y-4">
      {uniqueVideoUrls.map((url, index) => (
        <VideoItem
          key={url}
          url={url}
          index={index}
          thumbnail={thumbnails[url]}
          isSelected={selectedVideos.includes(url)}
          onSelect={() => onSelect(url)}
        />
      ))}
    </div>
  );
};

export default VideoList;