import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Clip } from "@/types/clip";
import { Copy, ExternalLink, Terminal, Globe, Download as DownloadIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DownloadGuideProps {
  clip: Clip;
  videoUrl: string;
}

export const DownloadGuide = ({ clip, videoUrl }: DownloadGuideProps) => {
  const { toast } = useToast();
  const [copiedCommand, setCopiedCommand] = useState(false);

  const extractYoutubeId = (url: string): string | null => {
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
  };

  const videoId = extractYoutubeId(videoUrl);
  const duration = clip.end_time - clip.start_time;

  const ytDlpCommand = videoId 
    ? `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" --download-sections "*${clip.start_time}-${clip.end_time}" "https://www.youtube.com/watch?v=${videoId}" -o "clip_${clip.id}.mp4"`
    : '';

  const copyCommand = () => {
    if (ytDlpCommand) {
      navigator.clipboard.writeText(ytDlpCommand);
      setCopiedCommand(true);
      toast({
        title: "Copied!",
        description: "Command copied to clipboard",
      });
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  const onlineDownloadUrl = videoId 
    ? `https://y2mate.com/youtube/${videoId}`
    : '';

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-accent/10">
        <div className="flex items-start gap-3">
          <DownloadIcon className="h-5 w-5 text-accent mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Download Your Clip</h4>
            <p className="text-sm text-muted-foreground">
              Choose from multiple methods to download your clip. Command line is recommended for best quality.
            </p>
          </div>
        </div>
      </Card>

      <Accordion type="single" collapsible defaultValue="method1" className="w-full">
        <AccordionItem value="method1">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>Method 1: Command Line (Recommended)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="p-4 space-y-3">
              <div>
                <p className="text-sm mb-2">
                  Use yt-dlp to download the exact clip with the best quality. This method extracts only the clip you need.
                </p>
                <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Install yt-dlp from <a href="https://github.com/yt-dlp/yt-dlp#installation" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">github.com/yt-dlp/yt-dlp</a></li>
                  <li>Copy the command below</li>
                  <li>Run it in your terminal</li>
                </ol>
              </div>

              <div className="space-y-2">
                <div className="bg-secondary p-3 rounded-lg font-mono text-xs break-all">
                  {ytDlpCommand}
                </div>
                <Button onClick={copyCommand} variant="outline" size="sm" className="w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  {copiedCommand ? "Copied!" : "Copy Command"}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded">
                <p className="font-medium mb-1">What this does:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Downloads video in up to 1080p quality</li>
                  <li>Extracts only the clip section ({clip.start_time}s to {clip.end_time}s)</li>
                  <li>Saves as MP4 file ready to edit</li>
                </ul>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="method2">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Method 2: Online Services</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="p-4 space-y-3">
              <p className="text-sm">
                Use web-based downloaders. You'll need to manually trim the video to the clip timestamps.
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="font-medium text-sm mb-1">Clip Timestamps:</p>
                  <p className="text-sm text-muted-foreground">
                    Start: {formatTime(clip.start_time)} • End: {formatTime(clip.end_time)} • Duration: {duration}s
                  </p>
                </div>

                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(onlineDownloadUrl, '_blank')}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Y2Mate - Easy to use
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://savefrom.net/?url=${videoUrl}`, '_blank')}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    SaveFrom.net - Fast downloads
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://9xbuddy.org/process?url=${videoUrl}`, '_blank')}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    9xBuddy - Multiple formats
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded">
                <p className="font-medium mb-1">After downloading:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use a video editor to trim to exact timestamps</li>
                  <li>Try VLC Media Player (free) or any video editor</li>
                  <li>Export in MP4 format for best compatibility</li>
                </ul>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="method3">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              <span>Method 3: Browser Extensions</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="p-4 space-y-3">
              <p className="text-sm">
                Install a browser extension to download videos directly from YouTube.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="font-medium text-sm mb-2">Video DownloadHelper</p>
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Available for Chrome and Firefox</li>
                    <li>Click the extension icon while watching the video</li>
                    <li>Choose quality and download</li>
                  </ul>
                </div>

                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="font-medium text-sm mb-2">YouTube Video Downloader</p>
                  <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Simple one-click download</li>
                    <li>Multiple quality options</li>
                    <li>Download button appears on video page</li>
                  </ul>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Note: After downloading, use video editing software to trim to the exact clip timestamps.
              </p>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="method4">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              <span>Method 4: Desktop Software</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="p-4 space-y-3">
              <p className="text-sm mb-3">
                Desktop applications for downloading and managing video content.
              </p>

              <div className="space-y-2">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="font-medium text-sm">4K Video Downloader</p>
                  <p className="text-xs text-muted-foreground">Full-featured, supports playlists and channels</p>
                </div>

                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="font-medium text-sm">JDownloader 2</p>
                  <p className="text-xs text-muted-foreground">Free, open-source, supports many sites</p>
                </div>

                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="font-medium text-sm">ByClick Downloader</p>
                  <p className="text-xs text-muted-foreground">One-click downloads, batch processing</p>
                </div>
              </div>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="p-4 bg-secondary/50">
        <h4 className="font-semibold mb-2 text-sm">After Downloading</h4>
        <p className="text-xs text-muted-foreground mb-2">
          Use free video editors to add your captions and audio:
        </p>
        <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
          <li><span className="font-medium">DaVinci Resolve</span> - Professional, free, full-featured</li>
          <li><span className="font-medium">Shotcut</span> - Simple, open-source, beginner-friendly</li>
          <li><span className="font-medium">OpenShot</span> - Easy to use, cross-platform</li>
        </ul>
      </Card>
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(0);
  return `${mins}:${secs.padStart(2, '0')}`;
}
