import { useEffect } from "react";

// Import components from the original LP-1 structure
import { Hero } from "@/components/home/Hero";
import { ValueProps } from "@/components/home/ValueProps";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";
import { Agents } from "@/components/home/Agents";
import { CTAStrip } from "@/components/home/CTAStrip";

export default function LP1Page() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="overflow-hidden min-h-screen">
      <Hero />
      <ValueProps />
      <FeaturedProperties />
      <WhyChooseUs />
      <Testimonials />
      <Agents />
      <CTAStrip />
    </main>
  );
}