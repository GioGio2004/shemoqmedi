import { CATEGORIES } from "@/lib/taxonomy";
import { Tag } from "@/components/site/ui";

/** Category filter as plain links (each category has its own static page). */
export function CategoryPills({
  active,
  counts,
}: {
  active?: string;
  counts: { total: number; byCategory: Record<string, number> };
}) {
  return (
    <nav aria-label="Categories" className="container-site">
      <ul className="flex flex-wrap gap-2 border-t border-black/10 pt-6">
        <li>
          <Tag href="/" active={!active}>
            All <sup className="ml-1 text-[9px]">{counts.total}</sup>
          </Tag>
        </li>
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Tag href={`/category/${c.slug}`} active={active === c.slug}>
              {c.name}
              <sup className="ml-1 text-[9px]">{counts.byCategory[c.slug] ?? 0}</sup>
            </Tag>
          </li>
        ))}
      </ul>
    </nav>
  );
}
