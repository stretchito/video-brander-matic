import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ProcessingForm from '@/components/processing/ProcessingForm';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

const Index = () => {
  const navigate = useNavigate();
  const {
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
    setPosition,
    setGreyscale,
    setFormat,
    handleProcess,
    handleVideoSelect,
    handleLogoSelect
  } = useVideoProcessing();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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
          onPositionChange={setPosition}
          onGreyscaleChange={setGreyscale}
          onFormatChange={setFormat}
          onProcess={handleProcess}
        />
      </div>
    </div>
  );
};

export default Index;