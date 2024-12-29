import { serve } from 'https://deno.fresh.dev/server'

serve(async (req) => {
  const cloudinaryConfig = {
    cloudName: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
    apiKey: Deno.env.get('CLOUDINARY_API_KEY'),
    apiSecret: Deno.env.get('CLOUDINARY_API_SECRET')
  }

  return new Response(
    JSON.stringify(cloudinaryConfig),
    { headers: { 'Content-Type': 'application/json' } }
  )
})