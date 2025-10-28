import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { DownloadGuide } from "@/components/DownloadGuide";
import { 
  Download, 
  Music, 
  Type, 
  Save, 
  Play,
  FileVideo,
  Loader2
} from "lucide-react";

interface ClipEditorProps {
  clip: {
    id: string;
    title: string;
    start_time: number;
    end_time: number;
    description: string;
    viral_score: number;
  };
  videoUrl: string;
  onSave?: (editedClip: any) => void;
}

interface Caption {
  text: string;
  startTime: number;
  endTime: number;
  position: 'top' | 'center' | 'bottom';
}

export const ClipEditor = ({ clip, videoUrl, onSave }: ClipEditorProps) => {
  const { toast } = useToast();
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [captionText, setCaptionText] = useState("");
  const [captionStart, setCaptionStart] = useState(0);
  const [captionEnd, setCaptionEnd] = useState(5);
  const [captionPosition, setCaptionPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [audioUrl, setAudioUrl] = useState("");
  const [audioVolume, setAudioVolume] = useState([50]);
  const [isDownloading, setIsDownloading] = useState(false);

  const addCaption = () => {
    if (!captionText.trim()) {
      toast({
        title: "Error",
        description: "Please enter caption text",
        variant: "destructive",
      });
      return;
    }

    const newCaption: Caption = {
      text: captionText,
      startTime: captionStart,
      endTime: captionEnd,
      position: captionPosition
    };

    setCaptions([...captions, newCaption]);
    setCaptionText("");
    
    toast({
      title: "Success",
      description: "Caption added successfully",
    });
  };

  const removeCaption = (index: number) => {
    setCaptions(captions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const editedClip = {
      ...clip,
      captions: JSON.stringify(captions),
      audio_url: audioUrl,
      is_edited: true,
      edited_at: new Date().toISOString()
    };

    if (onSave) {
      onSave(editedClip);
    }

    toast({
      title: "Success",
      description: "Clip edits saved successfully",
    });
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error("Invalid video URL");
      }

      // Method 1: Open YouTube with clip parameters
      const clipUrl = `https://www.youtube.com/clip/UgkxBhfX${videoId}?si=${clip.start_time}-${clip.end_time}`;
      
      // Method 2: Generate a download URL using a third-party service
      // Popular services: y2mate.com, savefrom.net, etc.
      const downloadServiceUrl = `https://www.y2mate.com/youtube/${videoId}?startTime=${clip.start_time}&endTime=${clip.end_time}`;
      
      // Method 3: Provide instructions for manual download
      const instructions = `
To download this clip in high quality:

1. Using Online Services:
   - Visit: https://www.y2mate.com/youtube/${videoId}
   - Or visit: https://savefrom.net/
   - Paste video URL and select quality (1080p recommended)
   - Download and trim from ${formatTime(clip.start_time)} to ${formatTime(clip.end_time)}

2. Using Browser Extensions:
   - Install "Video DownloadHelper" or "YouTube Downloader"
   - Navigate to: https://www.youtube.com/watch?v=${videoId}&t=${clip.start_time}s
   - Click the extension icon and select quality
   - Download and trim using a video editor

3. Using Command Line (Advanced):
   - Install yt-dlp: pip install yt-dlp
   - Run: yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" --download-sections "*${clip.start_time}-${clip.end_time}" "https://www.youtube.com/watch?v=${videoId}" -o "clip.mp4"

Video Info:
- Video ID: ${videoId}
- Start Time: ${formatTime(clip.start_time)} (${clip.start_time}s)
- End Time: ${formatTime(clip.end_time)} (${clip.end_time}s)
- Duration: ${clip.end_time - clip.start_time}s
`;

      // Show download options
      const userChoice = confirm(
        `Download Options:\n\n` +
        `1. Open YouTube clip page (best for preview)\n` +
        `2. Open Y2Mate download service\n` +
        `3. Copy download instructions\n\n` +
        `Click OK to see all download options, or Cancel to copy instructions to clipboard.`
      );

      if (userChoice) {
        // Open download modal with all options
        const downloadWindow = window.open('', '_blank');
        if (downloadWindow) {
          downloadWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Download Clip: ${clip.title}</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  max-width: 800px;
                  margin: 40px auto;
                  padding: 20px;
                  background: #f5f5f5;
                }
                .container {
                  background: white;
                  padding: 30px;
                  border-radius: 12px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                h1 { color: #333; margin-bottom: 10px; }
                h2 { color: #666; font-size: 1.2em; margin-top: 30px; }
                .info { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background: #007bff;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  margin: 10px 10px 10px 0;
                  font-weight: 500;
                }
                .button:hover { background: #0056b3; }
                .button.secondary { background: #6c757d; }
                .button.secondary:hover { background: #545b62; }
                pre {
                  background: #1e1e1e;
                  color: #d4d4d4;
                  padding: 15px;
                  border-radius: 6px;
                  overflow-x: auto;
                  font-size: 0.9em;
                }
                .step { margin: 20px 0; padding-left: 20px; border-left: 3px solid #007bff; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>📥 Download Clip: ${clip.title}</h1>
                
                <div class="info">
                  <strong>Video ID:</strong> ${videoId}<br>
                  <strong>Start:</strong> ${formatTime(clip.start_time)} (${clip.start_time}s)<br>
                  <strong>End:</strong> ${formatTime(clip.end_time)} (${clip.end_time}s)<br>
                  <strong>Duration:</strong> ${clip.end_time - clip.start_time}s<br>
                  <strong>Viral Score:</strong> ${clip.viral_score}/100
                </div>

                <h2>🎬 Quick Download Options</h2>
                
                <a href="https://www.youtube.com/watch?v=${videoId}&t=${clip.start_time}s" 
                   target="_blank" class="button">
                  ▶️ Open in YouTube
                </a>
                
                <a href="https://www.y2mate.com/youtube/${videoId}" 
                   target="_blank" class="button">
                  📥 Download via Y2Mate
                </a>
                
                <a href="https://savefrom.net/#url=https://www.youtube.com/watch?v=${videoId}" 
                   target="_blank" class="button secondary">
                  📥 Download via SaveFrom
                </a>

                <h2>📝 Method 1: Using Online Services (Easiest)</h2>
                <div class="step">
                  <p>1. Click "Download via Y2Mate" or "Download via SaveFrom" above</p>
                  <p>2. Select quality (1080p recommended for high quality)</p>
                  <p>3. Download the full video</p>
                  <p>4. Use a video editor to trim from ${formatTime(clip.start_time)} to ${formatTime(clip.end_time)}</p>
                  <p><em>Recommended editors: DaVinci Resolve (free), Shotcut, or OpenShot</em></p>
                </div>

                <h2>💻 Method 2: Using Command Line (Best Quality)</h2>
                <div class="step">
                  <p><strong>Step 1:</strong> Install yt-dlp</p>
                  <pre>pip install yt-dlp</pre>
                  
                  <p><strong>Step 2:</strong> Download the clip</p>
                  <pre>yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" --download-sections "*${clip.start_time}-${clip.end_time}" "https://www.youtube.com/watch?v=${videoId}" -o "${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4"</pre>
                  
                  <p><em>This downloads the clip directly in high quality (1080p)</em></p>
                </div>

                <h2>🔧 Method 3: Using ffmpeg (After downloading full video)</h2>
                <div class="step">
                  <p><strong>Step 1:</strong> Download full video using yt-dlp</p>
                  <pre>yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" "https://www.youtube.com/watch?v=${videoId}" -o "video.mp4"</pre>
                  
                  <p><strong>Step 2:</strong> Extract clip using ffmpeg</p>
                  <pre>ffmpeg -i video.mp4 -ss ${clip.start_time} -to ${clip.end_time} -c copy "${clip.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4"</pre>
                </div>

                <h2>🌐 Method 4: Browser Extensions</h2>
                <div class="step">
                  <p>1. Install a YouTube downloader extension:</p>
                  <ul>
                    <li>Video DownloadHelper (Firefox/Chrome)</li>
                    <li>YouTube Video Downloader (Chrome)</li>
                  </ul>
                  <p>2. Navigate to: <a href="https://www.youtube.com/watch?v=${videoId}&t=${clip.start_time}s" target="_blank">YouTube Video</a></p>
                  <p>3. Click the extension icon and select 1080p quality</p>
                  <p>4. Download and trim using a video editor</p>
                </div>

                <h2>🎵 Adding Audio & Captions</h2>
                <div class="step">
                  <p>After downloading, use video editing software to add:</p>
                  <ul>
                    <li><strong>Captions:</strong> Use DaVinci Resolve, Premiere Pro, or free tools like OpenShot</li>
                    <li><strong>Audio:</strong> Import your audio file and mix with original audio</li>
                    <li><strong>Export:</strong> H.264 codec, 1080p, 30fps for best quality</li>
                  </ul>
                </div>

                <div style="margin-top: 40px; padding: 20px; background: #fff3cd; border-radius: 8px;">
                  <strong>💡 Pro Tip:</strong> For automatic caption and audio overlay, use the "Edit Clip" feature 
                  in the main application before downloading. This will give you visual preview of your edits.
                </div>
              </div>
            </body>
            </html>
          `);
        }
      } else {
        // Copy instructions to clipboard
        await navigator.clipboard.writeText(instructions);
        toast({
          title: "Instructions Copied",
          description: "Download instructions copied to clipboard",
        });
      }

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate download options",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Edit Clip: {clip.title}</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Clip
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              variant="outline"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Edits
            </Button>
          </div>
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
              <Play className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="captions" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Caption Text</Label>
                <Textarea
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  placeholder="Enter caption text..."
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time (seconds)</Label>
                  <Input
                    type="number"
                    value={captionStart}
                    onChange={(e) => setCaptionStart(parseFloat(e.target.value))}
                    min={0}
                    max={clip.end_time - clip.start_time}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>End Time (seconds)</Label>
                  <Input
                    type="number"
                    value={captionEnd}
                    onChange={(e) => setCaptionEnd(parseFloat(e.target.value))}
                    min={captionStart}
                    max={clip.end_time - clip.start_time}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Position</Label>
                <div className="flex gap-2 mt-2">
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <Button
                      key={pos}
                      variant={captionPosition === pos ? "default" : "outline"}
                      onClick={() => setCaptionPosition(pos)}
                      className="flex-1"
                    >
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={addCaption} className="w-full">
                Add Caption
              </Button>

              {captions.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Captions ({captions.length})</Label>
                  {captions.map((caption, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{caption.text}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(caption.startTime)} - {formatTime(caption.endTime)} | {caption.position}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCaption(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Audio File URL (MP3 or WAV)</Label>
                <Input
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a URL to an audio file you want to overlay on the clip
                </p>
              </div>

              <div>
                <Label>Audio Volume: {audioVolume[0]}%</Label>
                <Slider
                  value={audioVolume}
                  onValueChange={setAudioVolume}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              {audioUrl && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm mb-2">Audio Preview:</p>
                  <audio controls className="w-full">
                    <source src={audioUrl} />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> Audio overlay is applied during download. 
                  Make sure your audio file is accessible via URL.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="download" className="space-y-4">
            <DownloadGuide
              videoId={extractVideoId(videoUrl) || ''}
              startTime={clip.start_time}
              endTime={clip.end_time}
              clipTitle={clip.title}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(videoUrl)}?start=${clip.start_time}&end=${clip.end_time}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                <h4 className="font-semibold">Clip Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2">{clip.end_time - clip.start_time}s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Viral Score:</span>
                    <span className="ml-2">{clip.viral_score}/100</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Captions:</span>
                    <span className="ml-2">{captions.length} added</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Audio:</span>
                    <span className="ml-2">{audioUrl ? 'Custom' : 'Original'}</span>
                  </div>
                </div>
              </div>

              {captions.length > 0 && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Captions Timeline</h4>
                  <div className="space-y-2">
                    {captions.map((caption, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-muted-foreground">
                          {formatTime(caption.startTime)} - {formatTime(caption.endTime)}:
                        </span>
                        <span className="ml-2">{caption.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
