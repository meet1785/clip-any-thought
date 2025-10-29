-- Add columns for editing features to clips table
ALTER TABLE public.clips ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.clips ADD COLUMN IF NOT EXISTS captions TEXT; -- JSON array of caption objects
ALTER TABLE public.clips ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE public.clips ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE public.clips ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Update policy for clips update
CREATE POLICY "Anyone can update clips" 
ON public.clips 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create table for storing downloaded clips metadata
CREATE TABLE IF NOT EXISTS public.clip_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  format TEXT NOT NULL DEFAULT 'mp4',
  quality TEXT NOT NULL DEFAULT '1080p',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on clip_downloads
ALTER TABLE public.clip_downloads ENABLE ROW LEVEL SECURITY;

-- Create policies for clip_downloads
CREATE POLICY "Downloads are viewable by everyone" 
ON public.clip_downloads 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create downloads" 
ON public.clip_downloads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update downloads" 
ON public.clip_downloads 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_clip_downloads_clip_id ON public.clip_downloads(clip_id);
CREATE INDEX idx_clip_downloads_status ON public.clip_downloads(status);
