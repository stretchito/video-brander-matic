import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PositionType } from '@/types/videoProcessing';

interface ProcessingOptionsProps {
  onPositionChange: (position: PositionType) => void;
  onGreyscaleChange: (enabled: boolean) => void;
  onFormatChange: (format: string) => void;
}

const ProcessingOptions = ({
  onPositionChange,
  onGreyscaleChange,
  onFormatChange
}: ProcessingOptionsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Logo Position</Label>
        <Select onValueChange={onPositionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top-left">Top Left</SelectItem>
            <SelectItem value="top-right">Top Right</SelectItem>
            <SelectItem value="bottom">Lower Third</SelectItem>
            <SelectItem value="center">Center</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Switch onCheckedChange={onGreyscaleChange} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Convert video to greyscale while keeping logo in color</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Label>Greyscale Video</Label>
      </div>

      <div className="space-y-2">
        <Label>Output Format</Label>
        <Select onValueChange={onFormatChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mp4">MP4</SelectItem>
            <SelectItem value="mov">MOV</SelectItem>
            <SelectItem value="avi">AVI</SelectItem>
            <SelectItem value="webm">WEBM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProcessingOptions;