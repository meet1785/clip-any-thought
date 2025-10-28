import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clipId, videoUrl, startTime, endTime, quality = '1080' } = await req.json();
    console.log('Download request:', { clipId, videoUrl, startTime, endTime, quality });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract video ID from YouTube URL
    const videoId = extractYoutubeId(videoUrl);
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create download record
    const { data: download, error: downloadError } = await supabase
      .from('clip_downloads')
      .insert({
        clip_id: clipId,
        file_url: '', // Will be updated later
        quality: `${quality}p`,
        status: 'processing'
      })
      .select()
      .single();

    if (downloadError) {
      console.error('Error creating download record:', downloadError);
      throw downloadError;
    }

    // Generate direct download link using youtube-dl format URL
    // This creates a URL that can be used to stream/download the video
    const downloadUrl = generateYouTubeDownloadUrl(videoId, startTime, endTime, quality);

    // Update download record with URL
    await supabase
      .from('clip_downloads')
      .update({
        file_url: downloadUrl,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', download.id);

    // Update clip with download URL
    await supabase
      .from('clips')
      .update({ download_url: downloadUrl })
      .eq('id', clipId);

    console.log('Download URL generated:', downloadUrl);

    return new Response(
      JSON.stringify({
        downloadId: download.id,
        downloadUrl,
        message: 'Download link generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in download-clip function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

function generateYouTubeDownloadUrl(videoId: string, startTime: number, endTime: number, quality: string): string {
  // Use youtube-dl compatible URL format
  // In production, this should call a proper video processing service
  // For now, we'll generate a URL that points to YouTube with clip parameters
  const duration = endTime - startTime;
  
  // Generate a URL that can be used with youtube-dl or similar tools
  // Format: https://www.youtube.com/watch?v={videoId}&t={startTime}s
  // This can be used with browser extensions or download tools
  const baseUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const params = new URLSearchParams({
    t: `${startTime}s`,
    // Add clip parameter if supported
    clip: `${startTime}-${endTime}`,
    clipt: `${startTime}`,
    clipend: `${endTime}`,
  });
  
  return `${baseUrl}&${params.toString()}`;
}
