-- Add editing features to clips table
ALTER TABLE clips 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS captions TEXT,
ADD COLUMN IF NOT EXISTS download_url TEXT,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Create index for edited clips
CREATE INDEX IF NOT EXISTS idx_clips_edited ON clips(is_edited, edited_at DESC);

-- Create table for tracking downloads
CREATE TABLE IF NOT EXISTS clip_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  format TEXT,
  quality TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on clip_downloads
ALTER TABLE clip_downloads ENABLE ROW LEVEL SECURITY;

-- Policy for viewing downloads
CREATE POLICY "Downloads are viewable by everyone"
ON clip_downloads FOR SELECT
USING (true);

-- Policy for creating downloads
CREATE POLICY "Anyone can create downloads"
ON clip_downloads FOR INSERT
WITH CHECK (true);