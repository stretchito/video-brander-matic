import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ProcessingForm from '@/components/processing/ProcessingForm';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { PositionType, VideoFormat } from '@/types/videoProcessing';
import { testFFmpegProcessing } from '@/utils/testFFmpeg';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

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

  const handlePositionChange = (pos: PositionType) => {
    setPosition(pos);
  };

  const handleFormatChange = (newFormat: VideoFormat) => {
    setFormat(newFormat);
  };

  const handleTestFFmpeg = async () => {
    if (!videoFiles.length || !logoFile) {
      toast.error('Please upload both a video and logo file first');
      return;
    }

    try {
      toast.info('Starting FFmpeg test...');
      const result = await testFFmpegProcessing(videoFiles[0].path, logoPath);
      
      if (result.success) {
        toast.success('FFmpeg test successful! Check the processed video.');
        console.log('Processed video URL:', result.publicUrl);
      } else {
        toast.error('FFmpeg test failed');
      }
    } catch (error) {
      console.error('FFmpeg test error:', error);
      toast.error('Error testing FFmpeg: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <header className="flex justify-between items-center py-4 px-6 bg-[#2A2F3C] rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
            PM Batch Video Processor
          </h1>
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={handleTestFFmpeg}
              className="bg-[#7E69AB] text-white hover:bg-[#6E59A5] border-none"
            >
              Test FFmpeg
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-[#7E69AB] text-white hover:bg-[#6E59A5] border-none"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

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