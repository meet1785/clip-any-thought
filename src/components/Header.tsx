import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold">OpusClip</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-accent transition-colors">
              Features
            </a>
            <a href="#clipanything" className="text-sm font-medium hover:text-accent transition-colors">
              ClipAnything
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-accent transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              Sign in
            </Button>
            <Button size="sm" className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              Sign up - It's FREE
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
