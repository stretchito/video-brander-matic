import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseFileUploadOptions {
  bucket: string;
  fileTypes: string[];
  onSuccess: (file: File, path: string) => void;
}

interface UploadOptions {
  metadata?: Record<string, any>;
}

export const useFileUpload = ({ bucket, fileTypes, onSuccess }: UseFileUploadOptions) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const handleUpload = useCallback(async (acceptedFiles: File[], options?: UploadOptions) => {
    const file = acceptedFiles[0];
    const fileType = file.type.split('/')[0];
    
    if (file && fileTypes.includes(fileType)) {
      try {
        setUploadProgress(0);
        const fileExt = file.name.split('.').pop();
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

        // Set initial progress
        setUploadProgress(10);

        // Create upload task with metadata if provided
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            ...(options?.metadata && { metadata: options.metadata })
          });

        if (uploadError) {
          throw uploadError;
        }

        // Set progress to 50% after upload starts
        setUploadProgress(50);

        setCurrentFile(file.name);
        onSuccess(file, filePath);
        toast.success('File uploaded successfully');
        
        // Set final progress
        setUploadProgress(100);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Error uploading file');
        setUploadProgress(0);
      }
    } else {
      toast.error(`Please upload a valid ${fileTypes.join(' or ')} file`);
    }
  }, [bucket, fileTypes, onSuccess]);

  return {
    uploadProgress,
    currentFile,
    handleUpload
  };
};