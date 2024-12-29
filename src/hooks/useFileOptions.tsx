import { useState } from 'react';

export const useFileOptions = () => {
  const [fileOptions, setFileOptions] = useState<Record<string, { transcription: boolean; captions: boolean }>>({});

  const handleTranscriptionChange = (path: string, enabled: boolean, uploadStates: Record<string, { path: string }>) => {
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

  const handleCaptionsChange = (path: string, enabled: boolean, uploadStates: Record<string, { path: string }>) => {
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

  return {
    fileOptions,
    setFileOptions,
    handleTranscriptionChange,
    handleCaptionsChange
  };
};