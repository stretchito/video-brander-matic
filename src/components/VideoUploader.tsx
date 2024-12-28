import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import FileList from './FileList';

interface VideoUploaderProps {
  onVideoSelect: (file: File, path: string) => void;
}

const VideoUploader = ({ onVideoSelect }: VideoUploaderProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; path: string }[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('video/')) {
      try {
        setUploadProgress(0);
        const fileExt = file.name.split('.').pop();
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              const percent = (progress.loaded / progress.total) * 100;
              setUploadProgress(percent);
            }
          });

        if (uploadError) {
          throw uploadError;
        }

        setUploadedFiles(prev => [...prev, { name: file.name, path: filePath }]);
        onVideoSelect(file, filePath);
        toast.success('Video uploaded successfully');
        setUploadProgress(100);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Error uploading video');
        setUploadProgress(0);
      }
    } else {
      toast.error('Please upload a valid video file');
    }
  }, [onVideoSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
          isDragActive ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="w-12 h-12 mb-4 text-gray-400" />
          <p className="mb-2 text-lg font-medium">
            {isDragActive ? 'Drop your video here' : 'Drag & drop your video here'}
          </p>
          <p className="text-sm text-gray-500">or click to select a file</p>
          <p className="mt-2 text-xs text-gray-400">Supported formats: MP4, MOV, AVI, WEBM</p>
        </div>
      </div>

      {uploadProgress > 0 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-500 text-center">
            {uploadProgress < 100 ? 'Uploading...' : 'Upload complete'}
          </p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <FileList files={uploadedFiles} />
      )}
    </div>
  );
};

export default VideoUploader;