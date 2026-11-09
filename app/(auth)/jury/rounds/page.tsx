import type { Metadata } from "next";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { JuryRounds } from "@/components/jury/JuryRounds";

export const metadata: Metadata = { title: "Jury rounds", robots: { index: false } };

// Jurors only (the page says so to anyone else). Site of the Month and Site
// of the Year rounds: score each candidate on the same weighted pillars.
export default function JuryRoundsPage() {
  return (
    <main id="main-content">
      <PageHero
        prelude="jury"
        title="Rounds"
        titleClassName="text-[clamp(3rem,9vw,9rem)] leading-[0.88]"
        lede="Score the month's Sites of the Day for Site of the Month, and in January the Sites of the Month for Site of the Year."
        action={
          <PillLink href="/jury/profile" variant="outline">
            Your profile
          </PillLink>
        }
      />
      <div className="container-site pb-24">
        <JuryRounds />
      </div>
    </main>
  );
}
