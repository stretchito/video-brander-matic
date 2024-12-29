import React from 'react';
import DuplicateFileDialog from '../DuplicateFileDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DuplicateFileHandlerProps {
  duplicateFile: { file: File; hash: string; existingPath: string } | null;
  setDuplicateFile: (file: { file: File; hash: string; existingPath: string } | null) => void;
  onVideoSelect: (file: File, path: string, options?: { transcription?: boolean; captions?: boolean }) => void;
  fileOptions: Record<string, { transcription: boolean; captions: boolean }>;
  handleUpload: (files: File[], options?: { metadata?: Record<string, any> }) => Promise<void>;
  setTotalSize: (cb: (prev: number) => number) => void;
}

const DuplicateFileHandler = ({
  duplicateFile,
  setDuplicateFile,
  onVideoSelect,
  fileOptions,
  handleUpload,
  setTotalSize
}: DuplicateFileHandlerProps) => {
  const handleKeepNew = async () => {
    if (!duplicateFile) return;

    try {
      await supabase.storage
        .from('videos')
        .remove([duplicateFile.existingPath]);

      setTotalSize(prev => prev + duplicateFile.file.size);
      await handleUpload([duplicateFile.file], { metadata: { fileHash: duplicateFile.hash } });
      
      toast.success('New file version uploaded successfully');
    } catch (error) {
      console.error('Error handling file replacement:', error);
      toast.error('Error replacing file');
    }

    setDuplicateFile(null);
  };

  const handleKeepExisting = async () => {
    if (!duplicateFile) return;

    try {
      const options = fileOptions[duplicateFile.file.name];
      onVideoSelect(duplicateFile.file, duplicateFile.existingPath, options);
      toast.success('Using existing file version');
    } catch (error) {
      console.error('Error using existing file:', error);
      toast.error('Error using existing file');
    }

    setDuplicateFile(null);
  };

  return (
    <DuplicateFileDialog
      isOpen={!!duplicateFile}
      fileName={duplicateFile?.file.name || ''}
      onKeepNew={handleKeepNew}
      onKeepExisting={handleKeepExisting}
      onClose={() => setDuplicateFile(null)}
    />
  );
};

export default DuplicateFileHandler;