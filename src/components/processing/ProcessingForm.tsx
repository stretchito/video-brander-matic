import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ProcessingOptions from '../ProcessingOptions';
import ProcessingStatus from './ProcessingStatus';
import UploadSection from './UploadSection';
import RequirementsCheck from './RequirementsCheck';
import { PositionType, VideoFormat } from '@/types/videoProcessing';

interface ProcessingFormProps {
  videoFiles: { file: File; path: string }[];
  logoFile: File | null;
  logoPath: string;
  position: PositionType;
  greyscale: boolean;
  format: VideoFormat;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  currentAction: string;
  progress: number;
  isProcessing: boolean;
  onVideoSelect: (file: File, path: string) => void;
  onLogoSelect: (file: File, path: string) => void;
  onPositionChange: (position: PositionType) => void;
  onGreyscaleChange: (enabled: boolean) => void;
  onFormatChange: (format: VideoFormat) => void;
  onProcess: () => Promise<void>;
}

const ProcessingForm = ({
  videoFiles,
  logoFile,
  logoPath,
  position,
  greyscale,
  format,
  status,
  currentAction,
  progress,
  isProcessing,
  onVideoSelect,
  onLogoSelect,
  onPositionChange,
  onGreyscaleChange,
  onFormatChange,
  onProcess
}: ProcessingFormProps) => {
  return (
    <>
      <Card className="w-full h-full bg-white border-[#3A3F4C] shadow-lg">
        <UploadSection
          type="video"
          onVideoSelect={onVideoSelect}
        />
      </Card>

      <Card className="w-full h-full bg-white border-[#3A3F4C] shadow-lg">
        <UploadSection
          type="logo"
          onLogoSelect={onLogoSelect}
        />
      </Card>

      <div className="space-y-4">
        <Card className="w-full bg-white border-[#3A3F4C] shadow-lg">
          <ProcessingOptions
            onPositionChange={onPositionChange}
            onGreyscaleChange={onGreyscaleChange}
            onFormatChange={onFormatChange}
          />
        </Card>

        <div className="flex justify-center">
          <TooltipProvider>
            <RequirementsCheck
              videoFiles={videoFiles}
              logoFile={logoFile}
              position={position}
              format={format}
              isProcessing={isProcessing}
              onProcess={onProcess}
            />
          </TooltipProvider>
        </div>

        <ProcessingStatus
          status={status}
          currentAction={currentAction}
          progress={progress}
        />
      </div>
    </>
  );
};

export default ProcessingForm;