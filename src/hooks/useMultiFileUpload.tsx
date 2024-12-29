import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadState {
  name: string;
  path: string;
  progress: number;
}

interface UseMultiFileUploadOptions {
  bucket: string;
  fileTypes: string[];
  onFileSelect: (file: File, path: string) => void;
}

export const useMultiFileUpload = ({ bucket, fileTypes, onFileSelect }: UseMultiFileUploadOptions) => {
  const [uploadStates, setUploadStates] = useState<Record<string, FileUploadState>>({});

  const handleUpload = useCallback(async (acceptedFiles: File[]) => {
    const newUploadStates: Record<string, FileUploadState> = {};

    for (const file of acceptedFiles) {
      const fileType = file.type.split('/')[0];
      
      if (!fileTypes.includes(fileType)) {
        toast.error(`${file.name}: Please upload a valid ${fileTypes.join(' or ')} file`);
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

        // Initialize upload state
        newUploadStates[file.name] = {
          name: file.name,
          path: filePath,
          progress: 10
        };
        setUploadStates(prev => ({ ...prev, ...newUploadStates }));

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Update progress and notify success
        setUploadStates(prev => ({
          ...prev,
          [file.name]: { ...prev[file.name], progress: 100 }
        }));
        
        onFileSelect(file, filePath);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Error uploading ${file.name}`);
        
        // Remove failed upload from states
        setUploadStates(prev => {
          const newState = { ...prev };
          delete newState[file.name];
          return newState;
        });
      }
    }
  }, [bucket, fileTypes, onFileSelect]);

  return {
    uploadStates,
    handleUpload
  };
};