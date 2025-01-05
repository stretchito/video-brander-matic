import { supabase } from '../lib/supabase';

export const uploadProcessedVideo = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  console.log('Uploading processed video:', fileName);
  
  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: true
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName);

  return publicUrl;
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
    const { data: currentJob } = await supabase
      .from('processing_jobs')
      .select('processing_steps')
      .eq('id', jobId)
      .single();

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
    }
  } catch (error) {
    console.error('Failed to update job progress:', error);
  }
};