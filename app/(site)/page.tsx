import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Shortlist } from "@/components/site/Shortlist";
import { Categories } from "@/components/site/Categories";
import { Awards } from "@/components/site/Awards";
import { Creators } from "@/components/site/Creators";
import { SubmitCta } from "@/components/site/SubmitCta";
import { Footer } from "@/components/site/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Fully static: rendered once at build time and served from the CDN.
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Shortlist />
        <Categories />
        <Awards />
        <Creators />
        <SubmitCta />
      </main>
      <Footer />
    </>
  );
}
