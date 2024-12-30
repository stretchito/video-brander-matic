import React from 'react';

const UploadLimits = () => {
  return (
    <div className="space-y-1">
      <p className="mt-2 text-xs text-gray-400">Max file size: 25MB, Total batch limit: 500MB</p>
      <p className="text-xs text-gray-400">Total storage limit: 5GB</p>
      <p className="text-xs text-gray-400">Supported formats: MP4, MOV, AVI, WEBM</p>
    </div>
  );
};

export default UploadLimits;