export interface ProcessVideoPayload {
  jobId: string;
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};