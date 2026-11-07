import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CREATORS } from "@/lib/showcase";
import { SectionHeader } from "./ui";

export async function Creators({ locale }: { locale: string }) {
  const t = await getTranslations("creators");

  return (
    <section aria-labelledby="creators" className="container-site scroll-mt-20 py-24">
      <SectionHeader id="creators" label={t("label")} title={t("title")} />
      <ul className="mt-10">
        {CREATORS.map((creator, i) => (
          <li
            key={creator.name}
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-line py-5 md:grid-cols-[3rem_1fr_10rem_8rem_8rem_auto]"
          >
            <span className="font-mono text-xs text-ink-soft">0{i + 1}</span>
            <span className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">
              {creator.name}
            </span>
            <span className="col-start-2 row-start-2 text-sm text-ink-soft md:col-start-auto md:row-start-auto">
              {creator.city}
            </span>
            <span className="hidden text-sm tabular-nums md:block">
              {t("awards", { count: creator.awards })}
            </span>
            <span className="hidden text-sm tabular-nums text-ink-soft md:block">
              {t("followers", { count: creator.followers })}
            </span>
            <Link
              href={`/${locale}/sign-up`}
              className="row-span-2 rounded-full border border-line px-4 py-1.5 text-sm hover:bg-beige md:row-span-1"
            >
              {t("follow")}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
