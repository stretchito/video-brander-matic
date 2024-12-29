import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ProcessingForm from '@/components/processing/ProcessingForm';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { PositionType, VideoFormat } from '@/types/videoProcessing';

const Index = () => {
  const navigate = useNavigate();
  const {
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
    setPosition,
    setGreyscale,
    setFormat,
    handleProcess,
    handleVideoSelect,
    handleLogoSelect
  } = useVideoProcessing();

  // Transform single video file into array format expected by ProcessingForm
  const videoFiles = videoFile ? [{ file: videoFile, path: videoPath }] : [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Create handlers that ensure proper typing
  const handlePositionChange = (pos: PositionType) => {
    setPosition(pos);
  };

  const handleFormatChange = (newFormat: VideoFormat) => {
    setFormat(newFormat);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary p-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">
            PM Batch Video Processor
          </h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="bg-white hover:bg-gray-100"
          >
            Logout
          </Button>
        </div>

        <ProcessingForm
          videoFiles={videoFiles}
          logoFile={logoFile}
          logoPath={logoPath}
          position={position}
          greyscale={greyscale}
          format={format}
          status={status}
          currentAction={currentAction}
          progress={progress}
          isProcessing={isProcessing}
          onVideoSelect={handleVideoSelect}
          onLogoSelect={handleLogoSelect}
          onPositionChange={handlePositionChange}
          onGreyscaleChange={setGreyscale}
          onFormatChange={handleFormatChange}
          onProcess={handleProcess}
        />
      </div>
    </div>
  );
};

export default Index;