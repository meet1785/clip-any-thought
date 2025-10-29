import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Terminal, 
  Globe, 
  Puzzle, 
  FileVideo,
  ExternalLink,
  Copy,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DownloadGuideProps {
  videoId: string;
  startTime: number;
  endTime: number;
  clipTitle: string;
}

export const DownloadGuide = ({ videoId, startTime, endTime, clipTitle }: DownloadGuideProps) => {
  const { toast } = useToast();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(label);
      setTimeout(() => setCopiedCommand(null), 2000);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const ytdlpCommand = `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" --download-sections "*${startTime}-${endTime}" "https://www.youtube.com/watch?v=${videoId}" -o "${clipTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp4"`;
  
  const ffmpegCommand = `ffmpeg -i video.mp4 -ss ${startTime} -to ${endTime} -c copy "${clipTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp4"`;

  const methods = [
    {
      icon: Terminal,
      title: "Command Line (Best Quality)",
      description: "Download directly in high quality using yt-dlp",
      difficulty: "Advanced",
      quality: "1080p",
      steps: [
        {
          title: "Install yt-dlp",
          command: "pip install yt-dlp",
          description: "Requires Python installed on your system"
        },
        {
          title: "Download Clip",
          command: ytdlpCommand,
          description: "Downloads the specific clip segment in high quality"
        }
      ]
    },
    {
      icon: Globe,
      title: "Online Services (Easiest)",
      description: "Use web-based tools to download and edit",
      difficulty: "Beginner",
      quality: "Up to 1080p",
      services: [
        {
          name: "Y2Mate",
          url: `https://www.y2mate.com/youtube/${videoId}`,
          description: "Popular, free, supports high quality"
        },
        {
          name: "SaveFrom.net",
          url: `https://savefrom.net/#url=https://www.youtube.com/watch?v=${videoId}`,
          description: "Fast downloads, multiple formats"
        },
        {
          name: "9xbuddy",
          url: `https://9xbuddy.org/process?url=https://www.youtube.com/watch?v=${videoId}`,
          description: "Simple interface, good quality"
        }
      ],
      note: "After downloading, use a video editor to trim from " + formatTime(startTime) + " to " + formatTime(endTime)
    },
    {
      icon: Puzzle,
      title: "Browser Extensions",
      description: "Install once, download anytime",
      difficulty: "Easy",
      quality: "Up to 1080p",
      extensions: [
        {
          name: "Video DownloadHelper",
          browsers: "Firefox, Chrome",
          url: "https://www.downloadhelper.net/"
        },
        {
          name: "YouTube Video Downloader",
          browsers: "Chrome, Edge",
          url: "https://chrome.google.com/webstore"
        }
      ],
      instructions: [
        "Install extension from browser store",
        "Navigate to YouTube video",
        "Click extension icon",
        "Select 1080p quality and download",
        "Trim video using editor"
      ]
    },
    {
      icon: FileVideo,
      title: "Desktop Software",
      description: "Professional tools for frequent use",
      difficulty: "Intermediate",
      quality: "Up to 4K",
      software: [
        {
          name: "4K Video Downloader",
          platform: "Windows, Mac, Linux",
          features: "Easy UI, batch downloads, playlists"
        },
        {
          name: "JDownloader 2",
          platform: "Windows, Mac, Linux",
          features: "Free, open-source, powerful"
        },
        {
          name: "ByClick Downloader",
          platform: "Windows, Mac",
          features: "One-click downloads, auto-detect"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-500/20">
            <Download className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Download Options for Your Clip</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Video ID:</span>
                <p className="font-mono font-semibold">{videoId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <p className="font-semibold">{endTime - startTime}s</p>
              </div>
              <div>
                <span className="text-muted-foreground">Start:</span>
                <p className="font-semibold">{formatTime(startTime)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">End:</span>
                <p className="font-semibold">{formatTime(endTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {methods.map((method, idx) => {
          const Icon = method.icon;
          return (
            <Card key={idx} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-accent/50 transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{method.title}</h4>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">{method.difficulty}</div>
                    <div className="text-xs font-semibold text-green-500">{method.quality}</div>
                  </div>
                </div>

                {method.steps && (
                  <div className="space-y-3">
                    {method.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{stepIdx + 1}. {step.title}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(step.command, step.title)}
                          >
                            {copiedCommand === step.title ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                        <code className="block p-3 bg-secondary/80 rounded text-xs overflow-x-auto">
                          {step.command}
                        </code>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {method.services && (
                  <div className="space-y-2">
                    {method.services.map((service, serviceIdx) => (
                      <div key={serviceIdx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(service.url, '_blank')}
                        >
                          Open <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {method.note && (
                      <p className="text-xs text-muted-foreground mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                        ⚠️ {method.note}
                      </p>
                    )}
                  </div>
                )}

                {method.extensions && (
                  <div className="space-y-3">
                    {method.extensions.map((ext, extIdx) => (
                      <div key={extIdx} className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm">{ext.name}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(ext.url, '_blank')}
                          >
                            Visit <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{ext.browsers}</p>
                      </div>
                    ))}
                    {method.instructions && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold">Steps:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          {method.instructions.map((instruction, instrIdx) => (
                            <li key={instrIdx} className="text-xs text-muted-foreground ml-2">
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {method.software && (
                  <div className="space-y-2">
                    {method.software.map((soft, softIdx) => (
                      <div key={softIdx} className="p-3 bg-secondary/50 rounded-lg">
                        <p className="font-semibold text-sm">{soft.name}</p>
                        <p className="text-xs text-muted-foreground">{soft.platform}</p>
                        <p className="text-xs text-muted-foreground mt-1">{soft.features}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Recommended: Free Video Editors for Trimming
        </h4>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 bg-card/50 rounded-lg">
            <p className="font-semibold text-sm">DaVinci Resolve</p>
            <p className="text-xs text-muted-foreground">Professional, free, all platforms</p>
          </div>
          <div className="p-3 bg-card/50 rounded-lg">
            <p className="font-semibold text-sm">Shotcut</p>
            <p className="text-xs text-muted-foreground">Open-source, easy to use</p>
          </div>
          <div className="p-3 bg-card/50 rounded-lg">
            <p className="font-semibold text-sm">OpenShot</p>
            <p className="text-xs text-muted-foreground">Simple, beginner-friendly</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
