import { getTranslations } from "next-intl/server";
import { CATEGORIES } from "@/lib/showcase";
import { SectionHeader } from "./ui";

export async function Categories() {
  const t = await getTranslations("categories");

  return (
    <section aria-labelledby="categories" className="container-site scroll-mt-20 pb-24">
      <SectionHeader id="categories" label={t("label")} title={t("title")} />
      {/* Category pages come later; for now these are a typographic index. */}
      <ul className="mt-10 flex flex-wrap gap-x-4 gap-y-1 text-[clamp(1.75rem,4.5vw,4rem)] font-semibold leading-[1.1] tracking-[-0.045em]">
        {CATEGORIES.map((name, i) => (
          <li key={name} className="flex items-baseline gap-4">
            <span className="text-ink transition-colors hover:text-ink-soft">{name}</span>
            {i < CATEGORIES.length - 1 && (
              <span aria-hidden className="text-line">
                /
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
