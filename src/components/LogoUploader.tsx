import React from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileUpload } from '@/hooks/useFileUpload';
import DuplicateFileDialog from './upload/DuplicateFileDialog';
import LogoDropzone from './upload/logo/LogoDropzone';
import LogoProgress from './upload/logo/LogoProgress';
import { useLogo } from './upload/logo/useLogo';
import { toast } from 'sonner';

interface LogoUploaderProps {
  onLogoSelect: (file: File, path: string) => void;
}

const LogoUploader = ({ onLogoSelect }: LogoUploaderProps) => {
  const { uploadProgress, currentFile, handleUpload } = useFileUpload({
    bucket: 'logos',
    fileTypes: ['image'],
    onSuccess: onLogoSelect
  });

  const { duplicateFile, setDuplicateFile, onDrop } = useLogo(onLogoSelect);

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
      await supabase.storage
        .from('logos')
        .remove([duplicateFile.existingPath]);

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
      onLogoSelect(duplicateFile.file, duplicateFile.existingPath);
      toast.success('Using existing logo version');
    } catch (error) {
      console.error('Error using existing logo:', error);
      toast.error('Error using existing logo');
    }

    setDuplicateFile(null);
  };

  return (
    <div className="space-y-4">
      <LogoDropzone
        onDrop={onDrop}
        isDragActive={isDragActive}
        getInputProps={getInputProps}
        getRootProps={getRootProps}
      />

      {uploadProgress > 0 && (
        <LogoProgress
          uploadProgress={uploadProgress}
          currentFile={currentFile}
        />
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