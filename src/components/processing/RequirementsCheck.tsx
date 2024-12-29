import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PositionType } from '@/types/videoProcessing';

interface RequirementsCheckProps {
  videoFiles: { file: File; path: string }[];
  logoFile: File | null;
  position: PositionType;
  format: 'mp4' | 'mov' | 'avi' | 'webm';
  isProcessing: boolean;
  onProcess: () => Promise<void>;
}

const RequirementsCheck = ({
  videoFiles,
  logoFile,
  position,
  format,
  isProcessing,
  onProcess
}: RequirementsCheckProps) => {
  const getMissingRequirements = () => {
    const missing = [];
    if (videoFiles.length === 0) missing.push('Video file');
    if (!logoFile) missing.push('Logo file');
    if (!position) missing.push('Logo position');
    if (!format) missing.push('Output format');
    return missing;
  };

  const missingItems = getMissingRequirements();
  const isReady = missingItems.length === 0 && !isProcessing;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Button
            onClick={onProcess}
            disabled={!isReady}
            className="bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            4. Process {videoFiles.length > 1 ? 'Videos' : 'Video'}
          </Button>
        </div>
      </TooltipTrigger>
      {!isReady && (
        <TooltipContent>
          <p>
            {isProcessing
              ? "Processing in progress..."
              : `Missing required items: ${missingItems.join(', ')}`}
          </p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default RequirementsCheck;