import { supabase } from '../lib/supabase';

export const uploadProcessedVideo = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  console.log('Uploading processed video:', fileName);
  
  try {
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading processed video:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    console.log('Video uploaded successfully, public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProcessedVideo:', error);
    throw error;
  }
};

export const updateJobProgress = async (
  jobId: string, 
  update: {
    status?: string;
    completedSteps?: number;
    totalSteps?: number;
    currentStep?: string;
    errorMessage?: string;
    outputPath?: string;
  }
) => {
  try {
    console.log('Updating job progress:', { jobId, update });

    const { data: currentJob } = await supabase
      .from('processing_jobs')
      .select('processing_steps, status')
      .eq('id', jobId)
      .single();

    // Don't update if job is already completed or errored
    if (currentJob?.status === 'completed' || currentJob?.status === 'error') {
      console.log('Job already finished, skipping update:', currentJob.status);
      return;
    }

    const processingSteps = currentJob?.processing_steps || [];
    if (update.currentStep) {
      processingSteps.push(update.currentStep);
    }

    const { error } = await supabase
      .from('processing_jobs')
      .update({
        status: update.status,
        completed_steps: update.completedSteps,
        total_steps: update.totalSteps,
        processing_steps: processingSteps,
        error_message: update.errorMessage,
        output_path: update.outputPath,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      console.error('Error updating job progress:', error);
      throw error;
    }

    console.log('Job progress updated successfully');
  } catch (error) {
    console.error('Failed to update job progress:', error);
    throw error;
  }
};