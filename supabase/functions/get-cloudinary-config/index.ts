
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const cloudinaryConfig = {
      cloudName: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
      apiKey: Deno.env.get('CLOUDINARY_API_KEY'),
      apiSecret: Deno.env.get('CLOUDINARY_API_SECRET')
    }

    // Validate that all required config values are present
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey || !cloudinaryConfig.apiSecret) {
      console.error('Missing Cloudinary configuration:', {
        hasCloudName: !!cloudinaryConfig.cloudName,
        hasApiKey: !!cloudinaryConfig.apiKey,
        hasApiSecret: !!cloudinaryConfig.apiSecret
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Incomplete Cloudinary configuration',
          details: 'One or more required Cloudinary configuration values are missing'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Log the configuration (without secrets) for debugging
    console.log('Cloudinary config retrieved:', { 
      cloudName: cloudinaryConfig.cloudName,
      hasApiKey: !!cloudinaryConfig.apiKey,
      hasApiSecret: !!cloudinaryConfig.apiSecret
    });

    return new Response(
      JSON.stringify(cloudinaryConfig),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-cloudinary-config:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to retrieve Cloudinary configuration',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
