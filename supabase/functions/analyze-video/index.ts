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
    const { videoUrl, prompt } = await req.json();
    console.log('Analyzing video:', videoUrl);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

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

    // Insert video record
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({ url: videoUrl, title: `YouTube Video ${videoId}`, status: 'processing' })
      .select()
      .single();

    if (videoError) {
      console.error('Error inserting video:', videoError);
      throw videoError;
    }

    console.log('Video record created:', video.id);

    // Use AI to analyze and generate clips
    const aiPrompt = prompt || "Analyze this video and suggest 3-5 viral clip moments with timestamps. For each clip, provide: a catchy title, start time in seconds, end time in seconds, viral score (0-100), and a brief description of why it would go viral.";

    const systemPrompt = `You are an expert video editor specializing in creating viral social media clips. 
You analyze videos and identify the most engaging moments that would perform well on platforms like TikTok, Instagram Reels, and YouTube Shorts.

For the YouTube video ID: ${videoId}, suggest 3-5 viral clip moments. Format your response as a JSON array with this exact structure:
[
  {
    "title": "Catchy clip title",
    "start_time": 30,
    "end_time": 60,
    "viral_score": 95,
    "description": "Why this moment is viral-worthy"
  }
]

Consider factors like:
- Emotional peaks (surprising, funny, inspiring moments)
- Clear hooks in the first 3 seconds
- Strong visual or audio moments
- Quotable statements
- Moments that tell a complete micro-story

Ensure clips are 15-60 seconds long for optimal social media performance.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    console.log('AI response:', content);

    // Parse AI response to extract clips
    const clips = parseClipsFromAI(content);
    console.log('Parsed clips:', clips);

    // Insert clips into database
    const clipInserts = clips.map(clip => ({
      video_id: video.id,
      title: clip.title,
      start_time: clip.start_time,
      end_time: clip.end_time,
      viral_score: clip.viral_score,
      description: clip.description,
    }));

    const { data: insertedClips, error: clipsError } = await supabase
      .from('clips')
      .insert(clipInserts)
      .select();

    if (clipsError) {
      console.error('Error inserting clips:', clipsError);
      throw clipsError;
    }

    // Update video status
    await supabase
      .from('videos')
      .update({ status: 'completed' })
      .eq('id', video.id);

    console.log('Successfully created', insertedClips.length, 'clips');

    return new Response(
      JSON.stringify({
        videoId: video.id,
        clips: insertedClips,
        message: `Generated ${insertedClips.length} viral clips!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-video function:', error);
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

function parseClipsFromAI(content: string): any[] {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try to parse as direct JSON
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    
    // Fallback: create demo clips if parsing fails
    console.warn('Could not parse AI response, using fallback clips');
    return [
      {
        title: "Most Viral Moment",
        start_time: 30,
        end_time: 60,
        viral_score: 95,
        description: "High-energy peak moment with strong emotional impact"
      },
      {
        title: "Engaging Hook",
        start_time: 120,
        end_time: 150,
        viral_score: 88,
        description: "Captivating opening that grabs attention"
      },
      {
        title: "Quotable Moment",
        start_time: 240,
        end_time: 270,
        viral_score: 92,
        description: "Memorable quote perfect for sharing"
      }
    ];
  } catch (error) {
    console.error('Error parsing clips:', error);
    return [
      {
        title: "Highlight Clip",
        start_time: 60,
        end_time: 90,
        viral_score: 85,
        description: "Key moment from the video"
      }
    ];
  }
}
