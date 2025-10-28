import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { VideoAnalyzer } from "@/components/VideoAnalyzer";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <section id="analyzer" className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-brand bg-clip-text text-transparent">
                Try It Now
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Paste any YouTube URL and watch AI generate viral clips instantly
            </p>
          </div>
          <VideoAnalyzer />
        </div>
      </section>
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
