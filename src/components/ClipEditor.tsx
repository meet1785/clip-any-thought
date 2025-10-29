import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Clip, EditedClip, Caption } from "@/types/clip";
import { Plus, Trash2, Music, Type, Download, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DownloadGuide } from "@/components/DownloadGuide";

interface ClipEditorProps {
  clip: Clip;
  videoUrl: string;
  onSave: (editedClip: EditedClip) => void;
}

export const ClipEditor = ({ clip, videoUrl, onSave }: ClipEditorProps) => {
  const { toast } = useToast();
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [newCaption, setNewCaption] = useState<Caption>({
    text: "",
    startTime: clip.start_time,
    endTime: clip.start_time + 2,
    position: "bottom"
  });
  const [audioUrl, setAudioUrl] = useState("");
  const [audioVolume, setAudioVolume] = useState(50);

  const handleAddCaption = () => {
    if (!newCaption.text.trim()) {
      toast({
        title: "Error",
        description: "Caption text cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (newCaption.startTime >= newCaption.endTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    setCaptions([...captions, { ...newCaption }]);
    setNewCaption({
      text: "",
      startTime: clip.start_time,
      endTime: clip.start_time + 2,
      position: "bottom"
    });

    toast({
      title: "Caption Added",
      description: "Caption has been added to the clip",
    });
  };

  const handleRemoveCaption = (index: number) => {
    setCaptions(captions.filter((_, i) => i !== index));
    toast({
      title: "Caption Removed",
      description: "Caption has been removed from the clip",
    });
  };

  const handleSaveEdits = () => {
    const editedClip: EditedClip = {
      id: clip.id,
      title: clip.title,
      start_time: clip.start_time,
      end_time: clip.end_time,
      description: clip.description,
      viral_score: clip.viral_score,
      captions: JSON.stringify(captions),
      audio_url: audioUrl,
      is_edited: true,
      edited_at: new Date().toISOString(),
    };

    onSave(editedClip);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Edit Clip</h3>
        <Button onClick={handleSaveEdits} size="sm">
          Save Edits
        </Button>
      </div>

      <Tabs defaultValue="captions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="captions">
            <Type className="mr-2 h-4 w-4" />
            Captions
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Music className="mr-2 h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="download">
            <Download className="mr-2 h-4 w-4" />
            Download
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="captions" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Caption Text</Label>
              <Input
                value={newCaption.text}
                onChange={(e) => setNewCaption({ ...newCaption, text: e.target.value })}
                placeholder="Enter caption text..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time (seconds)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newCaption.startTime}
                  onChange={(e) => setNewCaption({ ...newCaption, startTime: parseFloat(e.target.value) })}
                  min={clip.start_time}
                  max={clip.end_time}
                />
              </div>

              <div className="space-y-2">
                <Label>End Time (seconds)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newCaption.endTime}
                  onChange={(e) => setNewCaption({ ...newCaption, endTime: parseFloat(e.target.value) })}
                  min={clip.start_time}
                  max={clip.end_time}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Select
                value={newCaption.position}
                onValueChange={(value: 'top' | 'center' | 'bottom') => 
                  setNewCaption({ ...newCaption, position: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddCaption} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Caption
            </Button>
          </Card>

          {captions.length > 0 && (
            <div className="space-y-2">
              <Label>Added Captions ({captions.length})</Label>
              {captions.map((caption, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{caption.text}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(caption.startTime)} - {formatTime(caption.endTime)} • {caption.position}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCaption(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Audio URL</Label>
              <Input
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://example.com/audio.mp3"
                type="url"
              />
              <p className="text-sm text-muted-foreground">
                Add background music or voiceover to make your clip more engaging
              </p>
            </div>

            <div className="space-y-2">
              <Label>Audio Volume: {audioVolume}%</Label>
              <Slider
                value={[audioVolume]}
                onValueChange={([value]) => setAudioVolume(value)}
                max={100}
                step={1}
              />
            </div>

            {audioUrl && (
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Audio Preview</p>
                <audio controls className="w-full" src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="download" className="space-y-4">
          <DownloadGuide 
            clip={clip} 
            videoUrl={videoUrl}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="p-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Clip Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Duration:</span> {clip.end_time - clip.start_time}s</p>
                <p><span className="font-medium">Time Range:</span> {formatTime(clip.start_time)} - {formatTime(clip.end_time)}</p>
                <p><span className="font-medium">Viral Score:</span> {clip.viral_score}/100</p>
              </div>
            </div>

            {captions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Captions ({captions.length})</h4>
                <div className="space-y-2">
                  {captions.map((caption, index) => (
                    <div key={index} className="p-2 bg-secondary/50 rounded text-sm">
                      <p className="font-medium">{caption.text}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {audioUrl && (
              <div>
                <h4 className="font-semibold mb-2">Audio</h4>
                <p className="text-sm text-muted-foreground break-all">{audioUrl}</p>
                <p className="text-sm text-muted-foreground">Volume: {audioVolume}%</p>
              </div>
            )}

            <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
              <iframe
                src={`https://www.youtube.com/embed/${extractYoutubeId(videoUrl)}?start=${clip.start_time}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
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
