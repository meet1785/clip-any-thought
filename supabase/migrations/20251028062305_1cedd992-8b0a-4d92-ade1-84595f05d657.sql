-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  duration INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clips table
CREATE TABLE IF NOT EXISTS public.clips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  viral_score INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo)
CREATE POLICY "Videos are viewable by everyone" 
ON public.videos 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Clips are viewable by everyone" 
ON public.clips 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create clips" 
ON public.clips 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_clips_video_id ON public.clips(video_id);
CREATE INDEX idx_videos_created_at ON public.videos(created_at DESC);