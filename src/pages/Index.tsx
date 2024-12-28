import React, { useState } from 'react';
import VideoUploader from '../components/VideoUploader';
import LogoUploader from '../components/LogoUploader';
import ProcessingOptions from '../components/ProcessingOptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [position, setPosition] = useState('top-right');
  const [greyscale, setGreyscale] = useState(false);
  const [format, setFormat] = useState('mp4');

  const handleProcess = () => {
    // TODO: Implement video processing
    console.log('Processing video with options:', {
      video: videoFile?.name,
      logo: logoFile?.name,
      position,
      greyscale,
      format
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-secondary p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          PM Batch Video Processor
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoUploader onVideoSelect={setVideoFile} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <LogoUploader onLogoSelect={setLogoFile} />
              <div className="mt-6">
                <ProcessingOptions
                  onPositionChange={setPosition}
                  onGreyscaleChange={setGreyscale}
                  onFormatChange={setFormat}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleProcess}
            disabled={!videoFile || !logoFile}
            className="bg-cta hover:bg-cta/90 text-cta-foreground px-8 py-4 text-lg"
          >
            Process Video
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;