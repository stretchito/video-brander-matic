import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ProcessingForm from '@/components/processing/ProcessingForm';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { PositionType, VideoFormat } from '@/types/videoProcessing';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

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
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handlePositionChange = (pos: PositionType) => {
    setPosition(pos);
  };

  const handleFormatChange = (newFormat: VideoFormat) => {
    setFormat(newFormat);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            PM Batch Video Processor
          </h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="bg-white hover:bg-gray-100 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

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