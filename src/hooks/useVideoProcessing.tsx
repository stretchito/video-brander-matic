import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cloudinary } from '@/integrations/cloudinary/config';
import { toast } from 'sonner';
import { PositionType, ProcessingStatus, VideoFormat } from '@/types/videoProcessing';
import { uploadToCloudinary, getOverlayPosition } from '@/utils/cloudinaryUtils';

export const useVideoProcessing = () => {
  const [videoFiles, setVideoFiles] = useState<{ file: File; path: string }[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPath, setLogoPath] = useState<string>('');
  const [position, setPosition] = useState<PositionType>('top-right');
  const [greyscale, setGreyscale] = useState(false);
  const [format, setFormat] = useState<VideoFormat>('mp4');
  const [status, setStatus] = useState<ProcessingStatus>('waiting');
  const [currentAction, setCurrentAction] = useState('Waiting to start...');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string>('');

  const handleProcess = async () => {
    try {
      if (videoFiles.length === 0 || !logoFile) {
        toast.error('Please upload both video and logo files');
        return;
      }

      setIsProcessing(true);
      setStatus('processing');
      setCurrentAction('Uploading files to Cloudinary...');
      setProgress(10);

      // Upload logo first
      const logoUpload = await uploadToCloudinary(logoFile, 'image');
      setProgress(30);

      // Process each video
      for (const [index, { file }] of videoFiles.entries()) {
        setCurrentAction(`Processing video ${index + 1} of ${videoFiles.length}`);
        
        // Upload video to Cloudinary
        const videoUpload = await uploadToCloudinary(file, 'video');
        setProgress(50 + (index * 30 / videoFiles.length));

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Create transformation string
        const transformations = [];
        if (greyscale) {
          transformations.push('e_grayscale');
        }

        // Add logo overlay with position
        const overlayPosition = getOverlayPosition(position);
        const overlayTransform = `l_${logoUpload.public_id},g_${overlayPosition.gravity},x_${overlayPosition.x},y_${overlayPosition.y}`;
        transformations.push(overlayTransform);

        // Create final video URL with Cloudinary transformations
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const transformationString = transformations.join(',');
        const finalVideoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}/${videoUpload.public_id}.${format}`;
        
        setCurrentAction('Final Processing...');
        
        // Verify the video URL is accessible
        try {
          const response = await fetch(finalVideoUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error('Processed video not yet available');
          }
          setProcessedVideoUrl(finalVideoUrl);
        } catch (error) {
          console.error('Error verifying video URL:', error);
          throw new Error('Failed to verify processed video URL');
        }

        // Store job in Supabase
        const { error: jobError } = await supabase
          .from('processing_jobs')
          .insert({
            user_id: user.id,
            video_path: videoUpload.public_id,
            logo_path: logoUpload.public_id,
            position,
            greyscale,
            output_format: format,
            status: 'completed',
            output_path: finalVideoUrl
          });

        if (jobError) {
          throw jobError;
        }

        setProgress(70 + (index * 30 / videoFiles.length));
      }

      setProgress(100);
      setStatus('completed');
      setCurrentAction(processedVideoUrl);
      toast.success('Video processing completed!');

    } catch (error) {
      console.error('Processing error:', error);
      setStatus('error');
      setCurrentAction('Error processing video');
      setProgress(0);
      toast.error('Error processing video');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVideoSelect = (file: File, path: string) => {
    setVideoFiles(prev => [...prev, { file, path }]);
    toast.success('Video selected successfully');
  };

  const handleLogoSelect = (file: File, path: string) => {
    setLogoFile(file);
    setLogoPath(path);
    toast.success('Logo selected successfully');
  };

  return {
    videoFiles,
    logoFile,
    logoPath,
    position,
    greyscale,
    format,
    status,
    currentAction,
    progress,
    isProcessing,
    setPosition,
    setGreyscale,
    setFormat,
    handleProcess,
    handleVideoSelect,
    handleLogoSelect
  };
};