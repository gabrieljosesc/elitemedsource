# Elite MedSource

Wholesale medical & aesthetic supply storefront — Next.js 16 (App Router), Tailwind v4, Supabase (Postgres, Auth, Storage).

Same feature set as the Ace Medical / Peak Medical / Medicaplanet sites, with its own simple, modern design:

- Storefront: home, shop with search / category / brand / price filters & sorting, category pages, peptides page, product pages with volume pricing, COA downloads, reviews, wishlist, blog, info & legal pages, contact form
- Accounts: sign up (trade registration with license details), email verification, login, password reset, profile, addresses, saved cards, notifications, privacy, order history & order detail, update-payment flow
- Cart & checkout: cart with order minimum, coupons, shipping tiers, billing / shipping addresses (Google Places autocomplete), card-on-file (encrypted, never charged online), order confirmation + emails
- Admin (`/admin`): dashboard, orders (status, notes, item editor, payment-update requests), products (CRUD, images, specs, price tiers, COAs), coupons, blog, users

## Setup

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor (one file, top to bottom).
2. Copy `.env.local.example` to `.env.local` and fill it in (Supabase keys, `PAYMENT_CARD_SECRET`, contact details, SMTP).
3. In Supabase → Authentication → URL Configuration set the Site URL and add `http://localhost:3000/**` (and your production domain) to the redirect URLs.
4. Install and run:

```bash
npm install
npm run dev
```

5. Sign up on the site, then promote that user to admin:

```bash
npm run create:admin -- you@example.com
```

## Importing the catalog

To start with the Ace Medical catalog (categories, brands, products, images, COAs) instead of an empty store:

```bash
node scripts/copy-catalog.mjs --source-url=https://<ace-project>.supabase.co --source-key=<ace service role key>
```

Images and COA PDFs are re-uploaded into this project's storage buckets so nothing depends on the old project. Add `--skip-files` to keep the original URLs instead.

## Contact details

Phone, fax, and email live in `.env.local` (`NEXT_PUBLIC_CONTACT_*`) and are read by `src/lib/site.ts`. Phone and fax are hidden everywhere until they're filled in.

## Deploy

Vercel: import the repo, add every variable from `.env.local` to the project settings, deploy, then point Supabase Auth's Site URL / redirect URLs at the production domain.
