# shemoqmedi

Public site for **shemoqmedi.space** (www.shemoqmedi.space).

Starter state: Next.js 16 + Tailwind 4 / shadcn, Clerk auth, Convex, next-intl (ka default, en, ru),
Vercel + Ahrefs analytics.

The **Convex backend lives in the `shemoqmedi-admin` repo** (`convex/`). This app only calls it.
Function types for this app are declared by hand in `convex-helpers-api.ts`. Update that file
whenever you add or change a Convex function you call from here.

## What's wired

| Piece | Where |
| --- | --- |
| Sign-up / sign-in (Clerk) | `app/[locale]/sign-up`, `app/[locale]/sign-in` |
| Protected account page | `app/[locale]/account`; route guard in `proxy.ts` |
| Clerk → Convex auth | `components/ConvexClientProvider.tsx` |
| SEO basics | `app/robots.ts`, `app/sitemap.ts`, security headers in `next.config.ts` |

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
