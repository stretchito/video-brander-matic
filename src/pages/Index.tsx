import React from 'react';
import ProcessingForm from '@/components/processing/ProcessingForm';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

const Index = () => {
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

  const handlePositionChange = (pos: any) => {
    setPosition(pos);
  };

  const handleFormatChange = (newFormat: any) => {
    setFormat(newFormat);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
        <h1 className="text-2xl md:text-4xl font-bold text-white">
          PM Batch Video Processor
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
    </div>
  );
};

export default Index;