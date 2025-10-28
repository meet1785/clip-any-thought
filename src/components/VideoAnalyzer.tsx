import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, Sparkles, Loader2, Play, Download, Edit } from "lucide-react";
import { ClipEditor } from "@/components/ClipEditor";

interface Clip {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  viral_score: number;
  description: string;
}

export const VideoAnalyzer = () => {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState("");
  const [prompt, setPrompt] = useState("Give me the moments most likely to go viral on social media");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [videoId, setVideoId] = useState("");
  const [editingClipId, setEditingClipId] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setClips([]);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { videoUrl, prompt: prompt || undefined }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setVideoId(data.videoId);
      setClips(data.clips);
      
      toast({
        title: "Success!",
        description: data.message,
      });
    } catch (error: any) {
      console.error('Error analyzing video:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze video",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getYoutubeEmbedUrl = (url: string, startTime: number) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?start=${startTime}`;
    }
    return null;
  };

  const handleSaveClipEdits = async (editedClip: any) => {
    try {
      const { error } = await supabase
        .from('clips')
        .update({
          captions: editedClip.captions,
          audio_url: editedClip.audio_url,
          is_edited: editedClip.is_edited,
          edited_at: editedClip.edited_at
        })
        .eq('id', editedClip.id);

      if (error) throw error;

      // Update local state
      setClips(clips.map(c => c.id === editedClip.id ? { ...c, ...editedClip } : c));

      toast({
        title: "Success",
        description: "Clip edits saved successfully",
      });
    } catch (error) {
      console.error('Error saving clip edits:', error);
      toast({
        title: "Error",
        description: "Failed to save clip edits",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full space-y-8">
      <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              YouTube Video URL
            </label>
            <div className="relative">
              <Link className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="pl-12 h-14 bg-secondary/50 backdrop-blur-sm border-border"
                disabled={isAnalyzing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              AI Prompt (Optional)
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what kind of clips you want..."
              className="min-h-[100px] bg-secondary/50 backdrop-blur-sm border-border resize-none"
              disabled={isAnalyzing}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Video...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Viral Clips
              </>
            )}
          </Button>
        </div>
      </Card>

      {clips.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">
            Generated Clips ({clips.length})
          </h3>
          <div className="grid gap-4">
            {clips.map((clip) => {
              const embedUrl = getYoutubeEmbedUrl(videoUrl, clip.start_time);
              return (
                <Card
                  key={clip.id}
                  className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-accent/50 transition-all"
                >
                  <div className="grid md:grid-cols-[300px_1fr] gap-6">
                    <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                      {embedUrl ? (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-xl font-bold">{clip.title}</h4>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="px-3 py-1.5 rounded-full bg-accent/20 text-accent font-bold text-sm">
                            {clip.viral_score}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          {formatTime(clip.start_time)} - {formatTime(clip.end_time)}
                        </span>
                        <span>
                          {clip.end_time - clip.start_time}s clip
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground">{clip.description}</p>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => {
                            if (embedUrl) {
                              window.open(embedUrl, '_blank');
                            }
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Watch Clip
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingClipId(clip.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit & Download
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {editingClipId === clip.id && (
                    <div className="mt-6 border-t pt-6">
                      <ClipEditor 
                        clip={clip} 
                        videoUrl={videoUrl} 
                        onSave={handleSaveClipEdits}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
