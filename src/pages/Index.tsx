import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProcessingOptions from '../components/ProcessingOptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import ProcessingStatus from '@/components/processing/ProcessingStatus';
import UploadSection from '@/components/processing/UploadSection';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPath, setVideoPath] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPath, setLogoPath] = useState<string>('');
  const [position, setPosition] = useState('top-right');
  const [greyscale, setGreyscale] = useState(false);
  const [format, setFormat] = useState('mp4');
  const [status, setStatus] = useState<'waiting' | 'processing' | 'completed' | 'error'>('waiting');
  const [currentAction, setCurrentAction] = useState('Waiting to start...');
  const [progress, setProgress] = useState(0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleProcess = async () => {
    try {
      setStatus('processing');
      setCurrentAction('Creating processing job...');
      setProgress(10);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const { data: job, error: jobError } = await supabase
        .from('processing_jobs')
        .insert({
          user_id: user.id,
          video_path: videoPath,
          logo_path: logoPath,
          position,
          greyscale,
          output_format: format
        })
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      setProgress(30);
      setCurrentAction('Job created successfully. Processing will begin shortly...');
      toast.success('Processing job created successfully');
      
      // Simulate progress for testing
      let currentProgress = 30;
      const interval = setInterval(() => {
        if (currentProgress >= 90) {
          clearInterval(interval);
          setStatus('completed');
          setCurrentAction('Processing completed successfully!');
          setProgress(100);
          toast.success('Processing completed!');
        } else {
          currentProgress += 10;
          setProgress(currentProgress);
          setCurrentAction(`Processing video... ${currentProgress}%`);
        }
      }, 1000);

    } catch (error) {
      console.error('Processing error:', error);
      setStatus('error');
      setCurrentAction('Error processing video');
      setProgress(0);
      toast.error('Error processing video');
    }
  };

  const handleVideoSelect = (file: File, path: string) => {
    setVideoFile(file);
    setVideoPath(path);
    toast.success('Video uploaded successfully');
  };

  const handleLogoSelect = (file: File, path: string) => {
    setLogoFile(file);
    setLogoPath(path);
    toast.success('Logo uploaded successfully');
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

        <UploadSection
          onVideoSelect={handleVideoSelect}
          onLogoSelect={handleLogoSelect}
        />

        <Card className="w-full">
          <CardHeader>
            <CardTitle>3. Processing Options</CardTitle>
          </CardHeader>
          <CardContent>
            <ProcessingOptions
              onPositionChange={setPosition}
              onGreyscaleChange={setGreyscale}
              onFormatChange={setFormat}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleProcess}
            disabled={!videoFile || !logoFile}
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
    </div>
  );
};

export default Index;