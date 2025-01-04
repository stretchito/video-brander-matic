import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PositionType, VideoFormat } from '@/types/videoProcessing';

interface ProcessingOptionsProps {
  onPositionChange: (position: PositionType) => void;
  onGreyscaleChange: (enabled: boolean) => void;
  onFormatChange: (format: VideoFormat) => void;
}

const ProcessingOptions = ({
  onPositionChange,
  onGreyscaleChange,
  onFormatChange
}: ProcessingOptionsProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Label className="text-[#E5DEFF]">Logo Position</Label>
        <Select onValueChange={onPositionChange}>
          <SelectTrigger className="bg-[#1A1F2C] border-[#3A3F4C] text-[#E5DEFF]">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent className="bg-[#2A2F3C] border-[#3A3F4C]">
            <SelectItem value="top-left" className="text-[#E5DEFF] hover:bg-[#3A3F4C]">Top Left</SelectItem>
            <SelectItem value="top-right" className="text-[#E5DEFF] hover:bg-[#3A3F4C]">Top Right</SelectItem>
            <SelectItem value="bottom" className="text-[#E5DEFF] hover:bg-[#3A3F4C]">Lower Third</SelectItem>
            <SelectItem value="center" className="text-[#E5DEFF] hover:bg-[#3A3F4C]">Center</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Switch 
                  onCheckedChange={onGreyscaleChange}
                  className="data-[state=checked]:bg-[#9b87f5]"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#2A2F3C] border-[#3A3F4C] text-[#E5DEFF]">
              <p>Convert video to greyscale while keeping logo in color</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Label className="text-[#E5DEFF]">Greyscale Video</Label>
      </div>

      <div className="space-y-2">
        <Label className="text-[#E5DEFF]">Output Format</Label>
        <Select onValueChange={onFormatChange}>
          <SelectTrigger className="bg-[#1A1F2C] border-[#3A3F4C] text-[#E5DEFF]">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent className="bg-[#2A2F3C] border-[#3A3F4C]">
            <SelectItem value="mp4" className="text-[#E5DEFF] hover:bg-[#3A3F4C]">MP4</SelectItem>
            <SelectItem value="mov" className="text-[#E5DEFF] hover:bg-[#3A3F4C]">MOV</SelectItem>
            <SelectItem value="avi" className="text-[#E5DEFF] hover:bg-[#3A3F4C]">AVI</SelectItem>
            <SelectItem value="webm" className="text-[#E5DEFF] hover:bg-[#3A3F4C]">WEBM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProcessingOptions;