import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleTestFFmpeg = async () => {
    toast.info('Starting FFmpeg test...');
    try {
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
  );
};

export default Header;