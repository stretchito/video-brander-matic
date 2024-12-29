import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StorageFile {
  name: string;
  size: number;
  path: string;
}

export const useStorageFiles = () => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFiles([]);
        return;
      }

      const [videoFiles, logoFiles] = await Promise.all([
        supabase.storage.from('videos').list(user.id),
        supabase.storage.from('logos').list(user.id)
      ]);

      if (videoFiles.error) throw videoFiles.error;
      if (logoFiles.error) throw logoFiles.error;

      const allFiles = [
        ...(videoFiles.data || []).map(f => ({ ...f, bucket: 'videos' })),
        ...(logoFiles.data || []).map(f => ({ ...f, bucket: 'logos' }))
      ];

      setFiles(allFiles.map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        path: `${file.bucket}/${user.id}/${file.name}`
      })));
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (path: string) => {
    try {
      const [bucket, ...pathParts] = path.split('/');
      const filePath = pathParts.join('/');
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.path !== path));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const deleteAllFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const deletePromises = files.map(file => {
        const [bucket, ...pathParts] = file.path.split('/');
        const filePath = pathParts.join('/');
        return supabase.storage
          .from(bucket)
          .remove([filePath]);
      });

      const results = await Promise.all(deletePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        throw new Error(`Failed to delete ${errors.length} files`);
      }

      setFiles([]);
      toast.success('All files deleted successfully');
    } catch (error) {
      console.error('Error deleting all files:', error);
      toast.error('Failed to delete all files');
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return {
    files,
    loading,
    deleteFile,
    deleteAllFiles
  };
};