import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { PageHero } from "@/components/listing/PageHero";
import { JuryJoin } from "@/components/jury/JurorProfileForm";

export const metadata: Metadata = { title: "Join the jury", robots: { index: false } };

// Protected by proxy.ts: signed-out visitors go to sign-up and come back here.
export default async function JuryJoinPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <Header />
      <main id="main-content">
        <PageHero
          prelude="you're invited"
          title="Join the jury"
          titleClassName="text-[clamp(3rem,9vw,9rem)] leading-[0.88]"
          lede="Jurors score sites in their voting week on design, usability, creativity and code, and leave a short comment that appears on each site's page."
        />
        <div className="container-site pb-24">
          <JuryJoin token={token ?? ""} />
        </div>
      </main>
    </>
  );
}
