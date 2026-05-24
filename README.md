# Ishwari Socials

Marketing site and checkout for Ishwari Socials — a deal-closing service for physical-goods
businesses. Visitors pick a plan, sign in, and pay online; paid orders are recorded in
Supabase and the team follows up.

## Tech stack

- **Vite + React + TypeScript**
- **Tailwind CSS** + shadcn/ui components
- **Supabase** — auth, Postgres (`orders`, `profiles`), and Edge Functions
- **Payments** — Cashfree (default) and Razorpay, switchable via one env var

## Getting started

```bash
npm install
cp .env.example .env    # then fill in the values
npm run dev             # http://localhost:8080
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the codebase |
| `npm run test` | Run the test suite |

## Environment variables

See `.env.example` for the full list. The frontend needs the Supabase URL/anon key and the
active payment provider:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_PAYMENT_PROVIDER=cashfree   # or: razorpay
```

Server-side payment credentials are stored as Supabase Edge Function secrets, never in the
frontend bundle.

## Payments

The app ships both Cashfree and Razorpay integrations; exactly one is live at a time, chosen
by `VITE_PAYMENT_PROVIDER`. Each provider has three Edge Functions under
`supabase/functions/` — `*-create-order`, `*-verify-payment`, and `*-webhook` — and order
amounts are always derived server-side.

## Project structure

```
src/
  components/    UI + PaymentModal
  lib/           payment switch, provider SDK wrappers, supabase client, plans
  pages/         routes incl. payment success/failure
supabase/
  functions/     edge functions (cashfree-* and razorpay-*)
  migrations/    database schema
```
