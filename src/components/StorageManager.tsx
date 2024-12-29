import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const StorageManager = () => {
  const [files, setFiles] = useState<Array<{ name: string; size: number; path: string }>>([]);
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

      // Get video files
      const { data: videoFiles, error: videoError } = await supabase.storage
        .from('videos')
        .list(user.id);
      
      if (videoError) throw videoError;

      // Get logo files
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

  const handleDelete = async (path: string) => {
    try {
      const [bucket, ...pathParts] = path.split('/');
      const filePath = pathParts.join('/');
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      toast.success('File deleted successfully');
      loadFiles(); // Reload the file list
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDeleteAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all files from both buckets
      for (const file of files) {
        const [bucket, ...pathParts] = file.path.split('/');
        const filePath = pathParts.join('/');
        
        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) throw error;
      }

      toast.success('All files deleted successfully');
      loadFiles(); // Reload the file list
    } catch (error) {
      console.error('Error deleting all files:', error);
      toast.error('Failed to delete all files');
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return <div>Loading storage information...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Storage Manager</h3>
        {files.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete All Files
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your stored files.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        {files.length === 0 ? (
          <p className="text-muted-foreground">No files stored</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.path} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(file.path)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default StorageManager;