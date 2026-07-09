# Ishwari Socials

This is the website and checkout behind **Ishwari Socials** — a deal-closing service for
businesses that sell physical goods. The idea is simple: someone visits, picks a plan, signs
up, and pays online. Paid orders get saved in Supabase and my team takes it from there.

Live at **[ishwarisocials.co](https://ishwarisocials.co)**.

## What I built it with

I tried to keep the stack boring and reliable:

- **Vite + React + TypeScript** — the site itself
- **Tailwind CSS** + shadcn/ui — the styling and the ready-made components
- **Supabase** — login, the Postgres database (`orders` and `profiles` tables), and a handful of edge functions
- **Cashfree** — payments (UPI, cards, netbanking)

The frontend runs on **Vercel** (it rebuilds every time I push to `main`), and Supabase
handles the database and the secure server-side bits.

## Running it locally

```bash
npm install
cp .env.example .env    # then fill in your own values
npm run dev             # runs on http://localhost:8080
```

## The commands I use

| Command | What it does |
|---|---|
| `npm run dev` | Start the local dev server (port 8080) |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Preview that production build locally |
| `npm run lint` | Check the code for issues |
| `npm run test` | Run the tests |

## Environment variables

The frontend only needs two things (there's a template in `.env.example`):

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Anything to do with real money — the Cashfree keys — lives as **Supabase edge-function
secrets**, never in the frontend and never in this repo:

```bash
supabase secrets set CASHFREE_APP_ID=...
supabase secrets set CASHFREE_SECRET_KEY=...
supabase secrets set CASHFREE_ENV=sandbox      # flip to "production" to go live
supabase secrets set SITE_URL=https://ishwarisocials.co
```

Switching between test and live mode is just that one `CASHFREE_ENV` value — no code changes.

## How payments work

The one rule I stuck to: never let the browser decide whether a payment succeeded. When
someone pays —

1. The site asks the server (`cashfree-create-order`) to create the order, and **the price is
   worked out on the server**, never trusted from the browser.
2. Cashfree's hosted checkout takes the actual payment.
3. The server confirms the real status two independent ways — `cashfree-verify-payment` (when
   the customer lands back on the site) and `cashfree-webhook` (Cashfree notifying us
   directly). Both are safe to run twice, and a refunded order can never flip back to paid.

Those three functions live under `supabase/functions/`.

## Project structure

```
src/
  components/    the sections of the page + the login and payment popups
  lib/           supabase client, auth, plans, and the Cashfree wrapper
  pages/         the routes (landing page, payment success/failure, policy pages)
supabase/
  functions/     the Cashfree edge functions + shared helpers
  migrations/    how the database is built, step by step
```

## The plans

Two of them, both with a full money-back guarantee:

- **Starter — ₹2,000/year** — 1 guaranteed deal
- **Growth — ₹3,000/year** — 2 guaranteed deals

If we don't deliver, you get your money back. That's the whole promise.
