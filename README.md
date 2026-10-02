# Storefront & Admin Suite

A front-end e-commerce project with two connected halves: a customer storefront and
an admin dashboard, sharing one typed data layer.There's no real backend, everything runs against
a mock async API with real latency and error handling so the app deals with loading and error states the same way it would against the live server.

Demo admin login: `admin@comfortcrumb.com` / `admin123`

## What's in it

**Storefront**
- Product catalog with search, category filters, and sorting
- Persistent cart with quantity controls
- Multi-step checkout with client-side validation and server-side stock re-checks
- Auth with two roles: customers can shop and check out, only admins can reach `/admin`

**Admin dashboard**
- Overview page: stat cards with period-over-period change, a revenue trend chart, a
  category breakdown chart, and a best-sellers list, all switchable across date ranges
- Orders table: search, status filters, working pagination, inline status updates
- Product management: inline stock editing that saves on blur/Enter
- Settings: theme toggle, and a switch that simulates network failures so the error and
  retry states are easy to demo

**Cutting across both halves**
- Every screen that reads data handles loading, empty, and error states
- A shared `DataContext` triggers a refetch anywhere relevant after any write, so placing an
  order or editing stock updates every screen that depends on it, without prop drilling
- Dark mode, responsive layout down to mobile, and no external UI framework 

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Recharts ·
lucide-react

## Running it

```bash
npm install
npm run dev
```

The app seeds itself with several months of demo data on first load, so it's never empty.
Reset it anytime from **Settings** in the admin dashboard.

## Project structure

```
src/
  components/     Shared UI — cards, tables, modals, empty/error states, image fallback
  context/        Auth, cart, theme, and the data-refresh signal
  data/           Seed data and static reference data
  hooks/          useAsync (loading/error state for data fetching), useLocalStorage
  layouts/        Route layouts and the auth guard
  lib/            The mock API, formatting helpers, shared class strings
  pages/          Storefront pages and admin pages
  types.ts        Shared domain types
```

## What's missing

There is no real backend, no image upload for products, no email notifications and no tests yet.