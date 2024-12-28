import React, { useState } from 'react';
import VideoUploader from '../components/VideoUploader';
import LogoUploader from '../components/LogoUploader';
import ProcessingOptions from '../components/ProcessingOptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [position, setPosition] = useState('top-right');
  const [greyscale, setGreyscale] = useState(false);
  const [format, setFormat] = useState('mp4');
  const [status, setStatus] = useState<'waiting' | 'processing' | 'completed' | 'error'>('waiting');
  const [currentAction, setCurrentAction] = useState('Waiting to start...');

  const handleProcess = () => {
    setStatus('processing');
    setCurrentAction('Initializing video processing...');
    // TODO: Implement video processing
    console.log('Processing video with options:', {
      video: videoFile?.name,
      logo: logoFile?.name,
      position,
      greyscale,
      format
    });
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
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          PM Batch Video Processor
        </h1>

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
                <VideoUploader onVideoSelect={setVideoFile} />
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
            <LogoUploader onLogoSelect={setLogoFile} />
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

        <div className="flex justify-center gap-4 max-w-2xl mx-auto">
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
  );
};

export default Index;