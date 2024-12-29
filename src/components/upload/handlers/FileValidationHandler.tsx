import { useState } from 'react';
import { calculateFileHash } from '@/utils/fileHash';
import { supabase } from '@/integrations/supabase/client';

interface UseFileValidationProps {
  setTotalSize: (cb: (prev: number) => number) => void;
  setDuplicateFile: (file: { file: File; hash: string; existingPath: string } | null) => void;
  handleUpload: (files: File[], options?: { metadata?: Record<string, any> }) => Promise<void>;
}

export const useFileValidation = ({
  setTotalSize,
  setDuplicateFile,
  handleUpload
}: UseFileValidationProps) => {
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());

  const checkForDuplicates = async (file: File): Promise<{ isDuplicate: boolean; existingPath?: string }> => {
    try {
      const fileHash = await calculateFileHash(file);
      
      const { data: existingFiles } = await supabase
        .from('processing_jobs')
        .select('video_path')
        .eq('video_hash', fileHash)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .limit(1);

      if (existingFiles && existingFiles.length > 0) {
        return { isDuplicate: true, existingPath: existingFiles[0].video_path };
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return { isDuplicate: false };
    }
  };

  const handleValidFiles = async (validFiles: File[]) => {
    setProcessingFiles(new Set());

    for (const file of validFiles) {
      if (processingFiles.has(file.name)) {
        console.log('Skipping already processing file:', file.name);
        continue;
      }

      const { isDuplicate, existingPath } = await checkForDuplicates(file);
      
      if (isDuplicate && existingPath) {
        const fileHash = await calculateFileHash(file);
        setDuplicateFile({ file, hash: fileHash, existingPath });
        return;
      }

      setTotalSize(prev => prev + file.size);
      const fileHash = await calculateFileHash(file);
      await handleUpload([file], { metadata: { fileHash } });
    }
  };

  return {
    processingFiles,
    setProcessingFiles,
    handleValidFiles
  };
};