import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { calculateFileHash } from '@/utils/fileHash';
import { supabase } from '@/integrations/supabase/client';

export const useLogo = (onLogoSelect: (file: File, path: string) => void) => {
  const [duplicateFile, setDuplicateFile] = useState<{ file: File; hash: string; existingPath: string } | null>(null);

  const checkForDuplicates = async (file: File) => {
    try {
      const fileHash = await calculateFileHash(file);
      
      const { data: existingFiles } = await supabase
        .from('processing_jobs')
        .select('logo_path')
        .eq('logo_hash', fileHash)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .limit(1);

      if (existingFiles && existingFiles.length > 0) {
        return { isDuplicate: true, existingPath: existingFiles[0].logo_path, hash: fileHash };
      }

      return { isDuplicate: false, hash: fileHash };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return { isDuplicate: false, hash: '' };
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const { isDuplicate, existingPath, hash } = await checkForDuplicates(file);
    
    if (isDuplicate && existingPath) {
      setDuplicateFile({ file, hash, existingPath });
      return;
    }

    await handleUpload(acceptedFiles, { metadata: { fileHash: hash } });
  };

  return {
    duplicateFile,
    setDuplicateFile,
    onDrop,
    checkForDuplicates
  };
};