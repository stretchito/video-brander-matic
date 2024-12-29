import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, jobId, userId } = await req.json();
    console.log('Starting transcription for video:', videoUrl);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Update job status
    await supabase
      .from('processing_jobs')
      .update({
        transcription_status: 'processing',
        processing_steps: ['downloading_video', 'preparing_transcription'],
        total_steps: 4,
        completed_steps: 1
      })
      .eq('job_id', jobId);

    // Download video file
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();

    // Update progress
    await supabase
      .from('processing_jobs')
      .update({
        completed_steps: 2,
        processing_steps: ['downloading_video', 'preparing_transcription', 'transcribing']
      })
      .eq('job_id', jobId);

    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('file', videoBlob, 'video.mp4');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    console.log('Sending request to Whisper API...');
    
    // Send to Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const error = await whisperResponse.text();
      console.error('Whisper API error:', error);
      throw new Error(`Whisper API error: ${error}`);
    }

    const transcription = await whisperResponse.text();
    console.log('Transcription received, length:', transcription.length);

    // Update progress
    await supabase
      .from('processing_jobs')
      .update({
        completed_steps: 3,
        processing_steps: ['downloading_video', 'preparing_transcription', 'transcribing', 'saving_results']
      })
      .eq('job_id', jobId);

    // Generate text file content
    const textFileContent = `Video Transcription\n\n${transcription}`;
    const textBlob = new Blob([textFileContent], { type: 'text/plain' });
    
    // Upload text file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(`transcriptions/${jobId}.txt`, textBlob, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL for the text file
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(`transcriptions/${jobId}.txt`);

    // Update job with final status and URL
    await supabase
      .from('processing_jobs')
      .update({
        transcription_status: 'completed',
        transcription_url: publicUrl,
        completed_steps: 4,
        processing_steps: ['downloading_video', 'preparing_transcription', 'transcribing', 'saving_results', 'completed']
      })
      .eq('job_id', jobId);

    console.log('Transcription process completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        transcriptionUrl: publicUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in transcribe-video function:', error);

    // Update job with error status if possible
    if (error.jobId) {
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      await supabase
        .from('processing_jobs')
        .update({
          transcription_status: 'error',
          error_message: error.message
        })
        .eq('job_id', error.jobId);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});