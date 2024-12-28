import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProcessingOptions from '../ProcessingOptions';
import ProcessingStatus from './ProcessingStatus';
import UploadSection from './UploadSection';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
        <Button
          onClick={onProcess}
          disabled={!videoFile || !logoFile || isProcessing}
          className="bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white px-8 py-4 text-lg"
        >
          4. Process Video
        </Button>
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