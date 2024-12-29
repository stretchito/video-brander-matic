import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import VideoUploader from '../VideoUploader';
import LogoUploader from '../LogoUploader';

interface UploadSectionProps {
  type: 'video' | 'logo';
  onVideoSelect?: (file: File, path: string) => void;
  onLogoSelect?: (file: File, path: string) => void;
}

const UploadSection = ({ type, onVideoSelect, onLogoSelect }: UploadSectionProps) => {
  const isVideo = type === 'video';

  return (
    <>
      <CardHeader>
        <CardTitle>{isVideo ? '1. Select Video Source' : '2. Upload Logo'}</CardTitle>
      </CardHeader>
      <CardContent>
        {isVideo ? (
          <Tabs defaultValue="upload">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Local Upload</TabsTrigger>
              <TabsTrigger value="drive">Google Drive</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <VideoUploader onVideoSelect={onVideoSelect} />
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
        ) : (
          <LogoUploader onLogoSelect={onLogoSelect} />
        )}
      </CardContent>
    </>
  );
};

export default UploadSection;