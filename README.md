# shemoqmedi

Public site for **shemoqmedi.space** (www.shemoqmedi.space). English only.

Stack: Next.js 16 + Tailwind 4, Clerk auth, Convex, Vercel + Ahrefs analytics.
Priorities: speed and minimalism. The landing page is static and ships no client JS of its own.

The **Convex backend lives in the `shemoqmedi-admin` repo** (`convex/`). This app only calls it.
Function types for this app are declared by hand in `convex-helpers-api.ts`. Update that file
whenever you add or change a Convex function you call from here.

## Layout

| Piece | Where |
| --- | --- |
| Landing page (static) | `app/(site)/page.tsx`, sections in `components/site/` |
| Sample showcase data | `lib/showcase.ts` (fictional until submissions exist) |
| Sign-up / log-in (Clerk) | `app/(auth)/sign-up`, `app/(auth)/sign-in` |
| Protected account page | `app/(auth)/account`; route guard in `proxy.ts` |
| Clerk + Convex providers | `app/(auth)/layout.tsx` only, so public pages stay light |
| Design tokens | `app/globals.css` (white / beige-white, black text only, gold for the logo only) |
| SEO basics | `app/robots.ts`, `app/sitemap.ts`, security headers + old `/en` `/ka` `/ru` redirects in `next.config.ts` |

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
