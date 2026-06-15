import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LogoStrip } from "@/components/landing/LogoStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { BlueprintDemo } from "@/components/landing/BlueprintDemo";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      <Navbar />
      <Hero />
      <LogoStrip />
      <HowItWorks />
      <Features />
      <BlueprintDemo />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
