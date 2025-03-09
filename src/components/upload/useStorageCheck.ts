
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (updated from 25MB)
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

export const useStorageCheck = () => {
  const [totalSize, setTotalSize] = useState(0);

  const checkStorageLimits = async (acceptedFiles: File[]) => {
    const newTotalSize = acceptedFiles.reduce((acc, file) => acc + file.size, 0) + totalSize;
    
    // Check individual file sizes
    const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the 50MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return false;
    }

    // Check total batch size
    if (newTotalSize > MAX_TOTAL_SIZE) {
      toast.error('Total upload size exceeds 500MB limit');
      return false;
    }

    // Check current storage usage
    try {
      const { data: objects, error: listError } = await supabase.storage.from('videos').list();
      if (listError) throw listError;
      
      const currentSize = objects?.reduce((acc, obj) => acc + (obj.metadata?.size || 0), 0) || 0;
      
      if (currentSize + newTotalSize > MAX_STORAGE_SIZE) {
        toast.error('Storage limit of 5GB would be exceeded. Please delete some files first.');
        return false;
      }

      setTotalSize(newTotalSize);
      return true;
    } catch (error) {
      console.error('Error checking storage size:', error);
      toast.error('Unable to verify storage size. Please try again.');
      return false;
    }
  };

  return { checkStorageLimits };
};
