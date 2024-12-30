import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Circle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoItemProps {
  url: string;
  index: number;
  isSelected: boolean;
  thumbnail: string | undefined;
  onCheckboxChange: (url: string) => void;
}

const VideoItem = ({ url, index, isSelected, thumbnail, onCheckboxChange }: VideoItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg animate-fadeIn">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onCheckboxChange(url)}
          className="h-5 w-5"
        />
        <span className="font-medium">Video {index + 1}</span>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(url, '_blank')}
        className={cn(
          "rounded-full w-18 h-18 p-0 relative overflow-hidden",
          "hover:bg-secondary/20 transition-colors"
        )}
      >
        {thumbnail ? (
          <div className="relative w-[72px] h-[72px]">
            <img 
              src={thumbnail} 
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
              <PlayCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        ) : (
          <>
            <Circle className="w-full h-full absolute" />
            <PlayCircle className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default VideoItem;