import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { TrustedBy } from "@/components/trusted-by";
import { Stats } from "@/components/stats";
import { ToolsGrid } from "@/components/tools-grid";
import { AIFeatures } from "@/components/ai-features";
import { HowItWorks } from "@/components/how-it-works";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";
import FAQ from "@/components/faq";
import { CTA } from "@/components/cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-fg">
      <Navbar />

      <Hero />

      <TrustedBy />

      <Stats />

      <ToolsGrid />

      <AIFeatures />

      <HowItWorks />

      <Pricing />

      <Testimonials />

      <FAQ />

      <CTA />

      <Footer />
    </main>
  );
}