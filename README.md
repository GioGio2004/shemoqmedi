# shemoqmedi

Public site for **shemoqmedi.space** (www.shemoqmedi.space). English only.

Stack: Next.js 16 + Tailwind 4, Clerk auth, Convex, Vercel + Ahrefs analytics.
Priorities: speed and minimalism. Public pages are static (refreshed every 60 s) and ship no
client JS of their own. Design: the Kencho Group light layout, white and black only; all
colour comes from the listed websites' screenshots.

The **Convex backend lives in the `shemoqmedi-admin` repo** (`convex/`). This app only calls it.
Function types for this app are declared by hand in `convex-helpers-api.ts`, and categories /
technologies are copied in `lib/taxonomy.ts`. Update both whenever the backend changes.

## Layout

| Piece | Where |
| --- | --- |
| Home grid (approved listings) | `app/(site)/page.tsx` |
| Category pages | `app/(site)/category/[slug]` (one static page per category) |
| Site detail + JSON-LD | `app/(site)/sites/[slug]` (live link gets `?ref=shemoqmedi.space`) |
| Header / footer / pills | `components/site/` |
| Grid, hero, form, "your sites" | `components/listing/` |
| Listing form (after sign-up) | `app/(auth)/submit` → `components/listing/ListingForm.tsx` |
| Your sites + review status | `app/(auth)/account` → `components/listing/MyListings.tsx` |
| Sign-up / log-in (Clerk) | `app/(auth)/sign-up`, `app/(auth)/sign-in` |
| Clerk + Convex providers | `app/(auth)/layout.tsx` only, so public pages stay light |
| Route guard (`/account`, `/submit`) | `proxy.ts` |
| Design tokens | `app/globals.css` |
| SEO | `app/sitemap.ts` (home, categories, every live site), `app/robots.ts`, redirects in `next.config.ts` |

## Environment

`.env.local` (and Vercel):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # same Clerk instance as shemoqmedi-admin
CLERK_SECRET_KEY=
NEXT_PUBLIC_CONVEX_URL=              # same deployment as shemoqmedi-admin
NEXT_PUBLIC_URL=https://www.shemoqmedi.space
```

## Develop

```bash
npm install
npm run dev
```
