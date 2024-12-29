import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { calculateFileHash } from '@/utils/fileHash';
import { supabase } from '@/integrations/supabase/client';
import DuplicateFileDialog from './upload/DuplicateFileDialog';
import { toast } from 'sonner';

interface LogoUploaderProps {
  onLogoSelect: (file: File, path: string) => void;
}

const LogoUploader = ({ onLogoSelect }: LogoUploaderProps) => {
  const [duplicateFile, setDuplicateFile] = useState<{ file: File; hash: string; existingPath: string } | null>(null);
  
  const { uploadProgress, currentFile, handleUpload } = useFileUpload({
    bucket: 'logos',
    fileTypes: ['image'],
    onSuccess: onLogoSelect
  });

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });

  const handleKeepNew = async () => {
    if (!duplicateFile) return;

    try {
      // Delete the old file
      await supabase.storage
        .from('logos')
        .remove([duplicateFile.existingPath]);

      // Upload the new file
      await handleUpload([duplicateFile.file], { metadata: { fileHash: duplicateFile.hash } });
      
      toast.success('New logo version uploaded successfully');
    } catch (error) {
      console.error('Error handling logo replacement:', error);
      toast.error('Error replacing logo');
    }

    setDuplicateFile(null);
  };

  const handleKeepExisting = async () => {
    if (!duplicateFile) return;

    try {
      // Use the existing file
      onLogoSelect(duplicateFile.file, duplicateFile.existingPath);
      toast.success('Using existing logo version');
    } catch (error) {
      console.error('Error using existing logo:', error);
      toast.error('Error using existing logo');
    }

    setDuplicateFile(null);
  };

  const getProgressColor = () => {
    if (uploadProgress === 0) return 'bg-gray-200';
    if (uploadProgress === 100) return 'bg-green-500';
    return 'bg-blue-400';
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
          isDragActive ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Image className="w-12 h-12 mb-4 text-gray-400" />
          <p className="mb-2 text-lg font-medium">
            {isDragActive ? 'Drop your logo here' : 'Upload your logo'}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Select or drag & drop your logo file
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Accepted formats: PNG (recommended), JPG, JPEG, GIF</p>
            <p>Minimum resolution: 300x300 pixels</p>
            <p>PNG with transparency recommended for best results</p>
          </div>
        </div>
      </div>

      {uploadProgress > 0 && (
        <div className="space-y-2">
          <Progress 
            value={uploadProgress} 
            className="w-full" 
            indicatorClassName={`transition-colors duration-300 ${getProgressColor()}`}
          />
          <p className="text-sm text-gray-500 text-center">
            {uploadProgress < 100 ? 'Uploading...' : 'Upload complete'}
          </p>
          {currentFile && (
            <p className="text-sm text-center font-medium">
              Current file: {currentFile}
            </p>
          )}
        </div>
      )}

      <DuplicateFileDialog
        isOpen={!!duplicateFile}
        fileName={duplicateFile?.file.name || ''}
        onKeepNew={handleKeepNew}
        onKeepExisting={handleKeepExisting}
        onClose={() => setDuplicateFile(null)}
      />
    </div>
  );
};

export default LogoUploader;