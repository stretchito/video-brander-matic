import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const cloudinaryConfig = {
    cloudName: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
    apiKey: Deno.env.get('CLOUDINARY_API_KEY'),
    apiSecret: Deno.env.get('CLOUDINARY_API_SECRET')
  }

  // Log the configuration (without secrets) for debugging
  console.log('Cloudinary config retrieved:', { cloudName: cloudinaryConfig.cloudName })

  return new Response(
    JSON.stringify(cloudinaryConfig),
    { headers: corsHeaders }
  )
})