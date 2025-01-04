import React from 'react';
import ProcessingForm from '@/components/processing/ProcessingForm';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { PositionType, VideoFormat } from '@/types/videoProcessing';
import Header from '@/components/layout/Header';

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

  const handlePositionChange = (pos: PositionType) => {
    setPosition(pos);
  };

  const handleFormatChange = (newFormat: VideoFormat) => {
    setFormat(newFormat);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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