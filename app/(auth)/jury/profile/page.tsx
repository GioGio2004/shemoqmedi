import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { JuryProfile } from "@/components/jury/JurorProfileForm";

export const metadata: Metadata = { title: "Your jury profile", robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session).
export default async function JuryProfilePage({ searchParams }: { searchParams: Promise<{ joined?: string }> }) {
  const { joined } = await searchParams;
  return (
    <>
      <Header />
      <main id="main-content">
        <PageHero
          prelude={joined ? "welcome to the" : "your"}
          title={joined ? "Jury" : "Jury profile"}
          titleClassName={joined ? undefined : "text-[clamp(3rem,9vw,9rem)] leading-[0.88]"}
          lede={
            joined
              ? "You're on the jury. Open any site in live voting and use the Evaluate button in the bottom-right corner to score it."
              : "How you appear next to your evaluations and on the jury page."
          }
          action={
            <PillLink href="/collections/nominees" variant={joined ? "solid" : "outline"}>
              Sites in voting
            </PillLink>
          }
        />
        <div className="container-site pb-24">
          <JuryProfile />
        </div>
      </main>
    </>
  );
}
