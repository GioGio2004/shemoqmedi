"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MenuData, MenuSite } from "@/app/api/menu/route";
import { MediaImage as Image } from "@/components/site/MediaImage";
import { CATEGORIES, CATEGORY_GROUPS, TECHNOLOGIES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "./ui";

// The header's mega menu: a translucent curtain that drops from the top with
// every way into the site (pages, grouped categories, technologies), a few
// site covers, and live search. It opens from the Menu button, from the
// header search field (desktop) or the search button (phones), and with "/"
// or Ctrl/Cmd+K. The links are server-rendered (crawlable on every page);
// the data (search index, counts, covers) loads from /api/menu only once
// someone reaches for the menu.

export const EXPLORE = [
  { label: "Directory", href: "/" },
  { label: "Live voting", href: "/collections/nominees" },
  { label: "Site of the Day", href: "/collections/sotd" },
  { label: "Best Solo Creation", href: "/collections/bsc" },
  { label: "Honorable mentions", href: "/collections/hm" },
  { label: "Startups", href: "/collections/startups" },
  { label: "Creators", href: "/creators" },
  { label: "Jury", href: "/jury" },
  { label: "Badges", href: "/badges" },
  { label: "How we score", href: "/how-we-score" },
] as const;

const TECH_IN_MENU = TECHNOLOGIES.filter((t) => !["custom-cms", "custom-audio", "typescript", "mcp", "ai"].includes(t.slug));
const categoryName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

type MenuState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  query: string;
  setQuery: (q: string) => void;
  data: MenuData | null;
  load: () => void;
  menuButton: React.RefObject<HTMLButtonElement | null>;
  desktopField: React.RefObject<HTMLInputElement | null>;
  mobileField: React.RefObject<HTMLInputElement | null>;
};

const MenuContext = createContext<MenuState | null>(null);

function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menu parts must sit inside <MenuProvider>.");
  return ctx;
}

const isTyping = (el: Element | null) =>
  !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement).isContentEditable);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<MenuData | null>(null);
  const loading = useRef(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const desktopField = useRef<HTMLInputElement>(null);
  const mobileField = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const load = useCallback(() => {
    if (loading.current) return;
    loading.current = true;
    fetch("/api/menu")
      .then((r) => (r.ok ? (r.json() as Promise<MenuData>) : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch(() => {
        loading.current = false; // try again next time
      });
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) load();
      setOpenState(next);
    },
    [load],
  );

  // A new page closes the menu and clears the search (adjusting state
  // while rendering, React's pattern for "reset when a value changes").
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenState(false);
    setQuery("");
  }

  // While open: the page behind is inert and does not scroll; the header
  // drops its own glass so the curtain is one surface.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const behind = [document.getElementById("main-content"), document.querySelector("body > footer, footer")];
    root.dataset.menuOpen = "";
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    behind.forEach((el) => el?.setAttribute("inert", ""));
    return () => {
      delete root.dataset.menuOpen;
      root.style.overflow = overflow;
      behind.forEach((el) => el?.removeAttribute("inert"));
    };
  }, [open]);

  // Escape closes; "/" and Ctrl/Cmd+K open the search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpenState(false);
        const field = document.activeElement;
        if (field instanceof HTMLInputElement) field.blur();
        menuButton.current?.focus();
        return;
      }
      const shortcut = (e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isTyping(document.activeElement));
      if (!shortcut) return;
      e.preventDefault();
      setOpen(true);
      const field = desktopField.current?.offsetParent ? desktopField.current : mobileField.current;
      requestAnimationFrame(() => field?.focus());
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const value = useMemo(
    () => ({ open, setOpen, query, setQuery, data, load, menuButton, desktopField, mobileField }),
    [open, setOpen, query, data, load],
  );
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={cn("size-[18px]", className)}>
      <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.7" />
      <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const PLACEHOLDER = "Search websites, creators, categories";

/** Enter: open the best match. */
function useSubmit() {
  const { query, data } = useMenu();
  const router = useRouter();
  return () => {
    const r = search(query, data);
    if (r.sites[0]) router.push(`/sites/${r.sites[0].slug}`);
    else if (r.tags[0]) router.push(r.tags[0].href);
    else if (r.creators[0]) router.push(`/creators/${r.creators[0].slug}`);
  };
}

/** Desktop header search: focusing it opens the curtain; results show inside it. */
export function MenuSearchField({ className }: { className?: string }) {
  const { open, setOpen, query, setQuery, load, desktopField } = useMenu();
  const submit = useSubmit();
  return (
    <form
      role="search"
      className={cn(
        "relative items-center rounded-full border border-black/[0.08] bg-white transition-[border-color] focus-within:border-black",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <SearchIcon className="pointer-events-none absolute left-4 text-black/50" />
      <input
        ref={desktopField}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          // Only typing opens it: Escape also clears a search field (an
          // input event), which must not reopen the menu it just closed.
          if (!open && e.target.value) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onPointerEnter={load}
        placeholder={PLACEHOLDER}
        role="combobox"
        aria-label="Search the site"
        aria-controls="site-menu"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        className="h-[46px] w-full min-w-0 rounded-full bg-transparent pr-12 pl-11 text-[14px] outline-none placeholder:text-black/45 [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd className="pointer-events-none absolute right-3 grid h-6 min-w-6 place-items-center rounded-md border border-black/10 px-1.5 font-mono text-[11px] text-black/45">
        /
      </kbd>
    </form>
  );
}

/** Phones: a round search button that opens the curtain with its search field focused. */
export function MobileSearchButton({ className }: { className?: string }) {
  const { setOpen, mobileField, load } = useMenu();
  return (
    <button
      type="button"
      aria-label="Search the site"
      aria-controls="site-menu"
      onPointerEnter={load}
      onClick={() => {
        setOpen(true);
        // Focus inside the click (iOS only raises the keyboard for a focus in a user gesture).
        mobileField.current?.focus({ preventScroll: true });
      }}
      className={cn(
        "grid size-[46px] shrink-0 place-items-center rounded-full border border-black/12 bg-white hover:border-black",
        className,
      )}
    >
      <SearchIcon />
    </button>
  );
}

/** Menu / Close pill. */
export function MenuButton({ className }: { className?: string }) {
  const { open, setOpen, menuButton, load } = useMenu();
  return (
    <button
      ref={menuButton}
      type="button"
      aria-expanded={open}
      aria-controls="site-menu"
      onPointerEnter={load}
      onFocus={load}
      onClick={() => setOpen(!open)}
      // Phones show the round icon only (no room for the word next to the logo and search).
      aria-label={open ? "Close menu" : "Open menu"}
      className={cn(
        "flex min-h-[46px] shrink-0 items-center gap-4 rounded-full border border-black/12 bg-white p-1 text-[11.5px] font-semibold tracking-[0.05em] uppercase select-none hover:border-black sm:py-1 sm:pr-1.5 sm:pl-5",
        className,
      )}
    >
      <span aria-hidden="true" className="hidden w-[42px] text-left sm:inline">
        {open ? "Close" : "Menu"}
      </span>
      <span aria-hidden="true" className="relative grid size-9 place-items-center rounded-full bg-black">
        <span
          className={cn(
            "absolute h-[1.5px] w-3.5 rounded-full bg-white transition-transform duration-300",
            open ? "rotate-45" : "-translate-y-[3px]",
          )}
        />
        <span
          className={cn(
            "absolute h-[1.5px] w-3.5 rounded-full bg-white transition-transform duration-300",
            open ? "-rotate-45" : "translate-y-[3px]",
          )}
        />
      </span>
    </button>
  );
}

// ── Search ───────────────────────────────────────────────────────────────────

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

type Results = {
  sites: MenuSite[];
  creators: { slug: string; name: string }[];
  tags: { label: string; href: string }[];
};

function search(query: string, data: MenuData | null): Results {
  const q = norm(query.trim());
  if (!q) return { sites: [], creators: [], tags: [] };
  const tags = [
    ...CATEGORIES.filter((c) => c.slug !== "other").map((c) => ({ label: c.name, href: `/collections/${c.slug}` })),
    ...TECHNOLOGIES.map((t) => ({ label: t.name, href: `/collections/${t.slug}` })),
  ].filter((t) => norm(t.label).includes(q));
  if (!data) return { sites: [], creators: [], tags: tags.slice(0, 10) };

  const scored = data.sites
    .map((s) => {
      const title = norm(s.title);
      const score = title.startsWith(q)
        ? 4
        : title.includes(q)
          ? 3
          : norm(`${s.credit} ${s.creator?.name ?? ""}`).includes(q)
            ? 2
            : norm([...s.categories.map(categoryName), ...s.technologies].join(" ")).includes(q)
              ? 1
              : 0;
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const creators = new Map<string, { slug: string; name: string }>();
  for (const s of data.sites) if (s.creator && norm(s.creator.name).includes(q)) creators.set(s.creator.slug, s.creator);

  return { sites: scored.slice(0, 6).map((x) => x.s), creators: [...creators.values()].slice(0, 5), tags: tags.slice(0, 10) };
}

// ── Curtain ──────────────────────────────────────────────────────────────────

/** The menu's button: black glass, white text. */
const chip =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full bg-black/75 px-3.5 py-1 text-[13px] font-medium text-white backdrop-blur-sm transition-[background-color,transform] hover:bg-black active:scale-[0.98] lg:min-h-8 lg:px-3 lg:text-[12.5px]";

function Count({ n }: { n: number | undefined }) {
  if (!n) return null;
  return <span className="font-mono text-[10px] text-white/55">{n}</span>;
}

/** Cover with the title under it (no card frame). */
function SiteCard({ site, sizes }: { site: MenuSite; sizes: string }) {
  return (
    <Link href={`/sites/${site.slug}`} className="group block">
      <span className="relative block aspect-video overflow-hidden rounded-2xl bg-black/10">
        {site.cover && (
          <Image
            src={site.cover}
            alt=""
            fill
            sizes={sizes}
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </span>
      <span className="mt-2 flex items-start justify-between gap-3 px-0.5">
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] font-semibold tracking-[-0.02em]">{site.title}</span>
          <span className="block truncate text-[11.5px] text-black/55">by {site.credit}</span>
        </span>
        <ArrowIcon className="mt-0.5 size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow mb-3", className)}>{children}</p>;
}

function ChipList({
  items,
  counts,
}: {
  items: { key: string; label: string; href: string }[];
  counts?: Record<string, number>;
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item.key}>
          <Link href={item.href} className={chip}>
            {item.label}
            <Count n={counts?.[item.key]} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * One category group as a dropdown. Native <details> with a shared `name`:
 * opening one closes the others (no JavaScript), and the links stay in the
 * HTML while closed.
 */
function Dropdown({
  title,
  total,
  open,
  children,
}: {
  title: string;
  total: number;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details name="menu-collections" open={open} className="group border-b border-black/10 first:border-t">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 select-none [&::-webkit-details-marker]:hidden">
        <span className="text-[16px] font-semibold tracking-[-0.02em] lg:text-[15px]">
          {title}
          <span className="ml-2 font-mono text-[10.5px] font-normal text-black/45">{total}</span>
        </span>
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center rounded-full bg-black/75 text-white transition-transform duration-300 group-open:rotate-180"
        >
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="pt-1 pb-4">{children}</div>
    </details>
  );
}

function Browse({ data }: { data: MenuData | null }) {
  const counts = data?.counts;
  return (
    <div className="grid gap-9 lg:grid-cols-[200px_minmax(0,1fr)_260px] lg:gap-10 xl:grid-cols-[220px_minmax(0,1fr)_300px] xl:gap-14">
      <nav aria-label="Explore" data-reveal style={{ "--i": 0 } as React.CSSProperties}>
        <Eyebrow>Explore</Eyebrow>
        <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
          {EXPLORE.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex min-h-10 items-center justify-between gap-2 rounded-full bg-black/75 pr-2 pl-4 text-[13px] leading-tight font-semibold tracking-[-0.01em] text-white backdrop-blur-sm transition-colors hover:bg-black lg:min-h-9 lg:text-[12.5px]"
              >
                {item.label}
                <ArrowIcon className="hidden size-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100 lg:block" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Collections" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
        <Eyebrow>Collections</Eyebrow>
        {CATEGORY_GROUPS.map((group, i) => (
          <Dropdown key={group.name} title={group.name} total={group.slugs.length} open={i === 0}>
            <ChipList
              counts={counts}
              items={group.slugs.map((slug) => ({ key: slug, label: categoryName(slug), href: `/collections/${slug}` }))}
            />
          </Dropdown>
        ))}
        <Dropdown title="Built with" total={TECH_IN_MENU.length}>
          <ChipList
            counts={counts}
            items={TECH_IN_MENU.map((t) => ({ key: t.slug, label: t.name, href: `/collections/${t.slug}` }))}
          />
        </Dropdown>
      </nav>

      <div data-reveal style={{ "--i": 2 } as React.CSSProperties}>
        <Eyebrow>In the spotlight</Eyebrow>
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-1">
          {data
            ? data.spotlight
                .slice(0, 2)
                .map((s) => <SiteCard key={s.slug} site={s} sizes="(max-width: 1024px) 50vw, 300px" />)
            : [0, 1].map((i) => <div key={i} className="aspect-video rounded-2xl bg-black/10" />)}
        </div>
      </div>
    </div>
  );
}

function SearchResults({ query, data }: { query: string; data: MenuData | null }) {
  const r = search(query, data);
  const none = data && r.sites.length === 0 && r.creators.length === 0 && r.tags.length === 0;
  return (
    <div className="grid gap-7" aria-live="polite">
      {none && (
        <p className="text-2xl font-semibold tracking-[-0.03em]">
          No results for “{query.trim()}”. <span className="text-black/45">Try a site, a creator or a category.</span>
        </p>
      )}
      {r.sites.length > 0 && (
        <section>
          <Eyebrow>Websites</Eyebrow>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 xl:grid-cols-4">
            {r.sites.map((s) => (
              <li key={s.slug}>
                <SiteCard site={s} sizes="(max-width: 768px) 50vw, 320px" />
              </li>
            ))}
          </ul>
        </section>
      )}
      {(r.creators.length > 0 || r.tags.length > 0) && (
        <div className="grid gap-7 md:grid-cols-2">
          {r.creators.length > 0 && (
            <section>
              <Eyebrow>Creators</Eyebrow>
              <ChipList items={r.creators.map((c) => ({ key: c.slug, label: c.name, href: `/creators/${c.slug}` }))} />
            </section>
          )}
          {r.tags.length > 0 && (
            <section>
              <Eyebrow>Categories and technologies</Eyebrow>
              <ChipList items={r.tags.map((t) => ({ key: t.href, label: t.label, href: t.href }))} />
            </section>
          )}
        </div>
      )}
      {!data && r.tags.length === 0 && <p className="eyebrow">Loading…</p>}
    </div>
  );
}

const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
const CLOSED = "inset(0 0 100% 0)";
const OPENED = "inset(0 0 0 0)";

/**
 * The curtain itself. It hangs from the bottom of the navbar (80 px, 88 px
 * from md) and unrolls down to the bottom of the screen, so nothing ever
 * slides or scrolls under the bar; it scrolls inside if its content is
 * taller. Full screen on purpose: room for more (animations) later.
 * Closes with the Close button, Escape or any link. Sits beside the <header> (the header's glass would
 * trap a fixed child). Its glass, position and unroll are inline styles, so
 * opening and closing never depend on the global stylesheet (a stale dev
 * stylesheet once left it stuck open).
 */
export function MenuCurtain() {
  const { open, setOpen, query, setQuery, data, mobileField } = useMenu();
  const submit = useSubmit();
  return (
    <>
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        data-open={open}
        inert={!open}
        onClick={(e) => {
          // Any link closes the menu, including one to the page already open.
          if ((e.target as Element).closest("a")) setOpen(false);
        }}
        className="mega-curtain fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto overscroll-contain md:top-[88px]"
        style={{
          background: "rgb(255 255 255 / 0.6)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          backdropFilter: "blur(20px) saturate(1.5)",
          clipPath: open ? OPENED : CLOSED,
          visibility: open ? "visible" : "hidden",
          transition: open ? `clip-path 0.7s ${EASE}` : `clip-path 0.5s ${EASE}, visibility 0s linear 0.5s`,
        }}
      >
        <div className="container-site pt-6 pb-10 md:pt-10 lg:pb-12">
          <form
            role="search"
            className="relative mb-7 lg:hidden"
            data-reveal
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-black/50" />
            <input
              ref={mobileField}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={PLACEHOLDER}
              aria-label="Search the site"
              autoComplete="off"
              enterKeyHint="search"
              className="h-[50px] w-full rounded-full border border-black/[0.08] bg-white pr-4 pl-11 text-[16px] outline-none placeholder:text-black/45 focus:border-black [&::-webkit-search-cancel-button]:hidden"
            />
          </form>

          {query.trim() ? <SearchResults query={query} data={data} /> : <Browse data={data} />}

          {/* The header shows these pills from sm (submit) and lg (account) up. */}
          <div data-reveal style={{ "--i": 3 } as React.CSSProperties} className="mt-8 flex flex-wrap gap-2 lg:hidden">
            <Link
              href="/submit"
              className="inline-flex min-h-[46px] items-center rounded-full bg-black px-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase sm:hidden"
            >
              Submit a site
            </Link>
            <Link
              href="/account"
              className="inline-flex min-h-[46px] items-center rounded-full border border-black/12 bg-white px-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase"
            >
              Your account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
