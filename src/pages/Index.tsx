import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ClipAnything } from "@/components/ClipAnything";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <ClipAnything />
      <Features />
      <Footer />
    </div>
  );
};

export default Index;
