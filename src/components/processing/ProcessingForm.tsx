import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ProcessingOptions from '../ProcessingOptions';
import ProcessingStatus from './ProcessingStatus';
import UploadSection from './UploadSection';

interface ProcessingFormProps {
  videoFile: File | null;
  videoPath: string;
  logoFile: File | null;
  logoPath: string;
  position: string;
  greyscale: boolean;
  format: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  currentAction: string;
  progress: number;
  isProcessing: boolean;
  onVideoSelect: (file: File, path: string) => void;
  onLogoSelect: (file: File, path: string) => void;
  onPositionChange: (position: string) => void;
  onGreyscaleChange: (enabled: boolean) => void;
  onFormatChange: (format: string) => void;
  onProcess: () => Promise<void>;
}

const ProcessingForm = ({
  videoFile,
  videoPath,
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
  const getMissingRequirements = () => {
    const missing = [];
    if (!videoFile) missing.push('Video file');
    if (!logoFile) missing.push('Logo file');
    if (!position) missing.push('Logo position');
    if (!format) missing.push('Output format');
    return missing;
  };

  const missingItems = getMissingRequirements();
  const isReady = missingItems.length === 0 && !isProcessing;

  return (
    <div className="space-y-8">
      <UploadSection
        onVideoSelect={onVideoSelect}
        onLogoSelect={onLogoSelect}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>3. Processing Options</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcessingOptions
            onPositionChange={onPositionChange}
            onGreyscaleChange={onGreyscaleChange}
            onFormatChange={onFormatChange}
          />
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={onProcess}
                  disabled={!isReady}
                  className="bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  4. Process Video
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
        </TooltipProvider>
      </div>

      <ProcessingStatus
        status={status}
        currentAction={currentAction}
        progress={progress}
      />
    </div>
  );
};

export default ProcessingForm;