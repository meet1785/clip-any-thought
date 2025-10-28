import { Card } from "@/components/ui/card";
import { Zap, Brain, Share2, Scissors, Wand2, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "10x Faster Creation",
    description: "Turn hours of editing into minutes with AI-powered automation",
  },
  {
    icon: Brain,
    title: "Smart AI Analysis",
    description: "Analyzes visual, audio, and sentiment cues to find viral moments",
  },
  {
    icon: Scissors,
    title: "Precision Clipping",
    description: "Automatically identifies and extracts the best segments",
  },
  {
    icon: Share2,
    title: "Multi-Platform Publishing",
    description: "Publish to all social platforms in one click",
  },
  {
    icon: Wand2,
    title: "AI B-Roll Generator",
    description: "Automatically generates engaging b-roll for your clips",
  },
  {
    icon: TrendingUp,
    title: "Viral Prediction",
    description: "AI scores each clip's potential to go viral",
  },
];

export const Features = () => {
  return (
    <section className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Everything you need to
            <br />
            <span className="bg-gradient-brand bg-clip-text text-transparent">
              dominate social media
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful AI features designed to maximize your content's reach and engagement
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card
              key={idx}
              className="p-8 bg-card/50 backdrop-blur-sm border-border hover:border-accent/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="mb-4 inline-flex p-3 rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
