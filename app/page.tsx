import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ToolsGrid } from "@/components/tools-grid";
import { AIFeatures } from "@/components/ai-features";
import { HowItWorks } from "@/components/how-it-works";
import Pricing from "@/components/pricing";
import FAQ from "@/components/faq";
import { CTA } from "@/components/cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-fg">
      <Navbar />

      <Hero />

      <ToolsGrid />

      <AIFeatures />

      <HowItWorks />

      <Pricing />

      <FAQ />

      <CTA />

      <Footer />
    </main>
  );
}