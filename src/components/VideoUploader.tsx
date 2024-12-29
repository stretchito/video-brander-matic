import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import FileList from './FileList';
import { useMultiFileUpload } from '@/hooks/useMultiFileUpload';
import { toast } from 'sonner';
import UploadDropzone from './upload/UploadDropzone';
import { supabase } from '@/integrations/supabase/client';

interface VideoUploaderProps {
  onVideoSelect: (file: File, path: string, options?: { transcription?: boolean; captions?: boolean }) => void;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

const VideoUploader = ({ onVideoSelect }: VideoUploaderProps) => {
  const [totalSize, setTotalSize] = useState(0);
  const [fileOptions, setFileOptions] = useState<Record<string, { transcription: boolean; captions: boolean }>>({});

  const { uploadStates, handleUpload } = useMultiFileUpload({
    bucket: 'videos',
    fileTypes: ['video'],
    onFileSelect: async (file, path) => {
      const options = fileOptions[file.name];
      onVideoSelect(file, path, options);

      if (options?.transcription) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const { data: { publicUrl } } = supabase.storage
            .from('videos')
            .getPublicUrl(path);

          const { error } = await supabase.functions.invoke('transcribe-video', {
            body: {
              videoUrl: publicUrl,
              jobId: path,
              userId: user.id,
            },
          });

          if (error) throw error;
          toast.success('Transcription process started');
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Failed to start transcription process');
        }
      }
    }
  });

  const onDrop = async (acceptedFiles: File[]) => {
    const newTotalSize = acceptedFiles.reduce((acc, file) => acc + file.size, 0) + totalSize;
    
    // Check individual file sizes
    const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the 25MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Check total size
    if (newTotalSize > MAX_TOTAL_SIZE) {
      toast.error('Total upload size exceeds 500MB limit');
      return;
    }

    setTotalSize(newTotalSize);
    await handleUpload(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: true,
    maxSize: MAX_FILE_SIZE
  });

  const handleTranscriptionChange = (path: string, enabled: boolean) => {
    const fileName = Object.keys(uploadStates).find(key => uploadStates[key].path === path);
    if (fileName) {
      setFileOptions(prev => ({
        ...prev,
        [fileName]: {
          ...prev[fileName],
          transcription: enabled
        }
      }));
      // Update the file options in parent component
      const file = uploadStates[fileName];
      if (file) {
        onVideoSelect(file as unknown as File, path, { 
          transcription: enabled, 
          captions: fileOptions[fileName]?.captions || false 
        });
      }
    }
  };

  const handleCaptionsChange = (path: string, enabled: boolean) => {
    const fileName = Object.keys(uploadStates).find(key => uploadStates[key].path === path);
    if (fileName) {
      setFileOptions(prev => ({
        ...prev,
        [fileName]: {
          transcription: enabled ? true : (prev[fileName]?.transcription || false),
          captions: enabled
        }
      }));
      // Update the file options in parent component
      const file = uploadStates[fileName];
      if (file) {
        onVideoSelect(file as unknown as File, path, { 
          transcription: enabled ? true : (fileOptions[fileName]?.transcription || false), 
          captions: enabled 
        });
      }
    }
  };

  const uploadedFiles = Object.entries(uploadStates).map(([name, state]) => ({
    name,
    path: state.path,
    progress: state.progress,
    transcriptionEnabled: fileOptions[name]?.transcription || false,
    captionsEnabled: fileOptions[name]?.captions || false
  }));

  return (
    <div className="space-y-4">
      <UploadDropzone {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
      </UploadDropzone>

      {uploadedFiles.length > 0 && (
        <FileList 
          files={uploadedFiles}
          onTranscriptionChange={handleTranscriptionChange}
          onCaptionsChange={handleCaptionsChange}
        />
      )}
    </div>
  );
};

export default VideoUploader;