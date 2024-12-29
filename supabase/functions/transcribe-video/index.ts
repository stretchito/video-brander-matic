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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, jobId, userId } = await req.json();
    console.log('Starting transcription for video:', videoUrl);

    // Download video file
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();

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

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Store transcription in database
    const { error: dbError } = await supabase
      .from('video_transcriptions')
      .insert({
        job_id: jobId,
        user_id: userId,
        transcription: transcription,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});