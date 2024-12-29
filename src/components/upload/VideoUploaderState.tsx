import React, { useState } from 'react';
import { useTranscription } from '@/hooks/useTranscription';
import { useMultiFileUpload } from '@/hooks/useMultiFileUpload';
import { calculateFileHash } from '@/utils/fileHash';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DuplicateFileDialog from './DuplicateFileDialog';

interface VideoUploaderStateProps {
  onVideoSelect: (file: File, path: string, options?: { transcription?: boolean; captions?: boolean }) => void;
  children: (props: {
    totalSize: number;
    droppedFiles: File[];
    fileOptions: Record<string, { transcription: boolean; captions: boolean }>;
    uploadStates: Record<string, { path: string; progress: number }>;
    handleValidFiles: (validFiles: File[]) => Promise<void>;
    handleTranscriptionChange: (path: string, enabled: boolean) => void;
    handleCaptionsChange: (path: string, enabled: boolean) => void;
    setDroppedFiles: (files: File[]) => void;
    setFileOptions: React.Dispatch<React.SetStateAction<Record<string, { transcription: boolean; captions: boolean }>>>;
  }) => React.ReactNode;
}

const VideoUploaderState = ({ onVideoSelect, children }: VideoUploaderStateProps) => {
  const [totalSize, setTotalSize] = useState(0);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [fileOptions, setFileOptions] = useState<Record<string, { transcription: boolean; captions: boolean }>>({});
  const { startTranscription } = useTranscription();
  const [duplicateFile, setDuplicateFile] = useState<{ file: File; hash: string; existingPath: string } | null>(null);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());

  const { uploadStates, handleUpload } = useMultiFileUpload({
    bucket: 'videos',
    fileTypes: ['video'],
    onFileSelect: async (file, path) => {
      // Check if file is already being processed
      if (processingFiles.has(file.name)) {
        console.log('File already being processed:', file.name);
        return;
      }

      // Mark file as being processed
      setProcessingFiles(prev => new Set(prev).add(file.name));

      try {
        const options = fileOptions[file.name];
        await onVideoSelect(file, path, options);

        if (options?.transcription) {
          await startTranscription(file, path);
        }
      } finally {
        // Remove file from processing set when done
        setProcessingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      }
    }
  });

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
    // Clear any existing processing states
    setProcessingFiles(new Set());

    for (const file of validFiles) {
      // Skip if file is already being processed
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

  const handleKeepNew = async () => {
    if (!duplicateFile) return;

    try {
      // Delete the old file
      await supabase.storage
        .from('videos')
        .remove([duplicateFile.existingPath]);

      // Upload the new file
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
      // Use the existing file
      const options = fileOptions[duplicateFile.file.name];
      onVideoSelect(duplicateFile.file, duplicateFile.existingPath, options);
      toast.success('Using existing file version');
    } catch (error) {
      console.error('Error using existing file:', error);
      toast.error('Error using existing file');
    }

    setDuplicateFile(null);
  };

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
    }
  };

  return (
    <>
      {children({
        totalSize,
        droppedFiles,
        fileOptions,
        uploadStates,
        handleValidFiles,
        handleTranscriptionChange,
        handleCaptionsChange,
        setDroppedFiles,
        setFileOptions
      })}
      
      <DuplicateFileDialog
        isOpen={!!duplicateFile}
        fileName={duplicateFile?.file.name || ''}
        onKeepNew={handleKeepNew}
        onKeepExisting={handleKeepExisting}
        onClose={() => setDuplicateFile(null)}
      />
    </>
  );
};

export default VideoUploaderState;