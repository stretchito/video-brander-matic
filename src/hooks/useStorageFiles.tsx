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
      if (!user) return;

      const { data: jobs, error: jobsError } = await supabase
        .from('processing_jobs')
        .select('video_path, logo_path')
        .eq('user_id', user.id);

      if (jobsError) throw jobsError;

      const { data: videoFiles, error: videoError } = await supabase.storage
        .from('videos')
        .list(user.id);
      
      if (videoError) throw videoError;

      const { data: logoFiles, error: logoError } = await supabase.storage
        .from('logos')
        .list(user.id);
        
      if (logoError) throw logoError;

      const allFiles = [
        ...(videoFiles || []).map(f => ({ ...f, bucket: 'videos' })),
        ...(logoFiles || []).map(f => ({ ...f, bucket: 'logos' }))
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

      toast.success('File deleted successfully');
      loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const deleteAllFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (const file of files) {
        const [bucket, ...pathParts] = file.path.split('/');
        const filePath = pathParts.join('/');
        
        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) throw error;
      }

      toast.success('All files deleted successfully');
      loadFiles();
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