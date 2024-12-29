import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cloudinary } from '@/integrations/cloudinary/config';
import { toast } from 'sonner';
import { Transformation } from '@cloudinary/url-gen';
import { grayscale } from '@cloudinary/url-gen/actions/effect';
import { source } from '@cloudinary/url-gen/actions/overlay';
import { Position } from '@cloudinary/url-gen/qualifiers/position';
import { PositionType, ProcessingStatus } from '@/types/videoProcessing';
import { uploadToCloudinary, getOverlayPosition } from '@/utils/cloudinaryUtils';

export const useVideoProcessing = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPath, setVideoPath] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPath, setLogoPath] = useState<string>('');
  const [position, setPosition] = useState<PositionType>('top-right');
  const [greyscale, setGreyscale] = useState(false);
  const [format, setFormat] = useState('mp4');
  const [status, setStatus] = useState<ProcessingStatus>('waiting');
  const [currentAction, setCurrentAction] = useState('Waiting to start...');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    try {
      if (!videoFile || !logoFile) {
        toast.error('Please upload both video and logo files');
        return;
      }

      setIsProcessing(true);
      setStatus('processing');
      setCurrentAction('Uploading files to Cloudinary...');
      setProgress(10);

      // Upload video and logo to Cloudinary
      const [videoUpload, logoUpload] = await Promise.all([
        uploadToCloudinary(videoFile, 'video'),
        uploadToCloudinary(logoFile, 'image')
      ]);

      setProgress(50);
      setCurrentAction('Creating processing job...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create transformation configuration
      const transformation = new Transformation();
      
      if (greyscale) {
        transformation.effect(grayscale());
      }

      // Add logo overlay with position
      const overlayPosition = getOverlayPosition(position);
      transformation.overlay(
        source(logoUpload.public_id)
          .position(new Position()
            .gravity(overlayPosition.gravity)
            .offsetX(overlayPosition.x)
            .offsetY(overlayPosition.y))
      );

      // Create the final video URL with transformations
      const finalVideoUrl = cloudinary
        .video(videoUpload.public_id)
        .format(format)
        .addTransformation(transformation)
        .toURL();

      // Store job in Supabase
      const { data: job, error: jobError } = await supabase
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
        })
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      setProgress(100);
      setStatus('completed');
      setCurrentAction('Processing completed successfully!');
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
    setVideoFile(file);
    setVideoPath(path);
    toast.success('Video selected successfully');
  };

  const handleLogoSelect = (file: File, path: string) => {
    setLogoFile(file);
    setLogoPath(path);
    toast.success('Logo selected successfully');
  };

  return {
    videoFile,
    videoPath,
    logoFile,
    logoPath,
    position,
    greyscale,
    format,
    status,
    currentAction,
    progress,
    isProcessing,
    setPosition: (pos: PositionType) => setPosition(pos),
    setGreyscale,
    setFormat,
    handleProcess,
    handleVideoSelect,
    handleLogoSelect
  };
};