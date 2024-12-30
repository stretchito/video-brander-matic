import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { params } = await req.json()
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')

    if (!apiSecret) {
      console.error('Cloudinary API secret not configured');
      throw new Error('Cloudinary API secret not configured')
    }

    if (!params) {
      console.error('No params provided for signature generation');
      throw new Error('No params provided for signature generation');
    }

    console.log('Generating signature for params:', params);

    // Create signature using crypto
    const encoder = new TextEncoder();
    const data = encoder.encode(params + apiSecret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Generated signature successfully');

    return new Response(
      JSON.stringify(signature),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating signature:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error generating signature',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})