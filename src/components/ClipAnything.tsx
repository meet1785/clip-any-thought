import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const ClipAnything = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--gradient-purple))_0%,transparent_50%)] opacity-10" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-brand bg-clip-text text-transparent">
              ClipAnything
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            First-ever multimodal AI clipping that lets you clip any moment from any video
            using visual, audio, and sentiment cues.
          </p>
          <Button size="lg" className="mt-8 h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
            Clip any video now
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Just type your prompt.
            <br />
            <span className="text-muted-foreground">
              We will clip the right moments for you from any video.
            </span>
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Source video preview */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">
                Source video
              </h4>
              <div className="aspect-video rounded-xl bg-gradient-to-br from-secondary to-card border border-border flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-accent" />
                  </div>
                  <p className="text-muted-foreground">Your video preview</p>
                </div>
              </div>
            </Card>

            {/* Prompt input */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">
                Prompt
              </h4>
              <Textarea
                placeholder="Give me the moment most likely to go viral on social media"
                className="min-h-[200px] bg-secondary/50 backdrop-blur-sm border-border text-lg resize-none"
                defaultValue="Give me the moment most likely to go viral on social media"
              />
              <Button className="mt-4 w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                Generate Clips
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
