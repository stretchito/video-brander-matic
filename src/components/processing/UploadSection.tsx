import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoUploader from '../VideoUploader';
import LogoUploader from '../LogoUploader';
import GoogleDrivePicker from '../upload/GoogleDrivePicker';

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
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Local Upload</TabsTrigger>
              <TabsTrigger value="drive">Google Drive</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <VideoUploader onVideoSelect={onVideoSelect} />
            </TabsContent>
            <TabsContent value="drive">
              <GoogleDrivePicker onFileSelect={onVideoSelect} />
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