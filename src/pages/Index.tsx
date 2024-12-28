import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoUploader from '../components/VideoUploader';
import LogoUploader from '../components/LogoUploader';
import ProcessingOptions from '../components/ProcessingOptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

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
      if (!user) throw new Error('User not authenticated');

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

      if (jobError) throw jobError;

      setProgress(30);
      setCurrentAction('Job created successfully. Processing will begin shortly...');
      
      // Here you would typically trigger your processing function
      // For now, we'll simulate progress
      let currentProgress = 30;
      const interval = setInterval(() => {
        if (currentProgress >= 90) {
          clearInterval(interval);
          setStatus('completed');
          setCurrentAction('Processing completed successfully!');
          setProgress(100);
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
    }
  };

  const handleVideoSelect = (file: File, path: string) => {
    setVideoFile(file);
    setVideoPath(path);
  };

  const handleLogoSelect = (file: File, path: string) => {
    setLogoFile(file);
    setLogoPath(path);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return 'bg-[#33C3F0]';
      case 'processing':
        return 'bg-[#FEF7CD]';
      case 'completed':
        return 'bg-[#F2FCE2]';
      case 'error':
        return 'bg-[#ea384c]';
      default:
        return 'bg-[#33C3F0]';
    }
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

        <Card className="w-full">
          <CardHeader>
            <CardTitle>1. Select Video Source</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Local Upload</TabsTrigger>
                <TabsTrigger value="drive">Google Drive</TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <VideoUploader onVideoSelect={handleVideoSelect} />
              </TabsContent>
              <TabsContent value="drive">
                <div className="p-10 border-2 border-dashed rounded-lg text-center">
                  <img 
                    src="/lovable-uploads/ab643c32-7a17-4492-a85a-b889ea8e8bd8.png" 
                    alt="Google Drive"
                    className="w-12 h-12 mb-4 mx-auto"
                  />
                  <p className="mb-2 text-lg font-medium">Connect to Google Drive</p>
                  <p className="text-sm text-gray-500">Select videos from your Google Drive</p>
                  <Button variant="outline" className="mt-4">
                    Connect to Drive
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>2. Upload Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <LogoUploader onLogoSelect={handleLogoSelect} />
          </CardContent>
        </Card>

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

        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          <Progress value={progress} className="w-full" />
          
          <div className="flex justify-center gap-4">
            <Card className={`w-1/2 ${getStatusColor()} transition-colors duration-300`}>
              <CardHeader>
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium capitalize">{status}</p>
              </CardContent>
            </Card>

            <Card className="w-1/2">
              <CardHeader>
                <CardTitle className="text-sm">Current Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{currentAction}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;