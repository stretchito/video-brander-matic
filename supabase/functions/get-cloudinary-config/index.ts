
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get Cloudinary credentials from environment variables
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

    // Log what we found (safely without exposing full secrets)
    console.log('Cloudinary config requested, found:', { 
      cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret
    });
    
    // Validate that all required config values are present
    if (!cloudName || !apiKey || !apiSecret) {
      const missingFields = [];
      if (!cloudName) missingFields.push('CLOUDINARY_CLOUD_NAME');
      if (!apiKey) missingFields.push('CLOUDINARY_API_KEY');
      if (!apiSecret) missingFields.push('CLOUDINARY_API_SECRET');
      
      console.error(`Missing Cloudinary configuration: ${missingFields.join(', ')}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Incomplete Cloudinary configuration',
          details: `Missing fields: ${missingFields.join(', ')}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Return the configuration
    return new Response(
      JSON.stringify({
        cloudName,
        apiKey,
        apiSecret
      }),
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
