import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Upload } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--accent))_0%,transparent_50%)] opacity-20 animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center animate-fade-in">
        <div className="mb-4 inline-block">
          <span className="px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm text-sm font-medium border border-border">
            #1 AI VIDEO CLIPPING TOOL
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          1 long video,{" "}
          <span className="bg-gradient-brand bg-clip-text text-transparent">
            10 viral clips
          </span>
          .<br />
          Create 10x faster.
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          Turn long videos into shorts, and publish them to all social platforms in one click.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 max-w-3xl mx-auto">
          <div className="relative flex-1 w-full">
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Drop a video link"
              className="pl-12 h-14 bg-secondary/50 backdrop-blur-sm border-border text-lg"
            />
          </div>
          <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
            Get free clips
          </Button>
          <span className="text-muted-foreground">or</span>
          <Button 
            size="lg" 
            variant="outline" 
            className="h-14 px-8 text-lg font-semibold border-2 hover:bg-secondary/50 transition-all"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload files
          </Button>
        </div>

        {/* Feature preview cards */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-radial from-accent/20 to-transparent blur-3xl" />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[97, 99, 97, 98].map((score, idx) => (
              <div
                key={idx}
                className="aspect-[9/16] rounded-2xl bg-card/50 backdrop-blur-sm border border-border overflow-hidden group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-full h-full bg-gradient-to-br from-secondary to-card flex items-end p-4">
                  <div className="bg-accent/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold">
                    {score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
