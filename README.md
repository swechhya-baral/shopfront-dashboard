# Storefront & Admin Suite

A front-end e-commerce project with two connected halves: a customer storefront and
an admin dashboard, sharing one typed data layer. No real backend — everything runs against
a mock async API with real latency and error handling, so the app behaves the way it would
against a live server.

Demo admin login: `admin@comfortcrumb.com` / `admin123`

## What's in it

**Storefront**
- Product catalog with search, category filters, and sorting
- Persistent cart (survives a refresh) with quantity controls
- Multi-step checkout with client-side validation and server-side stock re-checks
- Auth with two roles — customers can shop and check out, only admins can reach `/admin`

**Admin dashboard**
- Overview page: stat cards with period-over-period change, a revenue trend chart, a
  category breakdown chart, and a best-sellers list, all switchable across date ranges
- Orders table: search, status filters, working pagination, inline status updates
- Product management: inline stock editing that saves on blur/Enter
- Settings: theme toggle, and a switch that simulates network failures so the error and
  retry states are easy to demo

**Cutting across both halves**
- Every screen that reads data handles loading, empty, and error states — nothing renders
  only the happy path
- A shared `DataContext` triggers a refetch anywhere relevant after any write, so placing an
  order or editing stock updates every screen that depends on it, without prop drilling
- Dark mode, responsive layout down to mobile, and no external UI framework — every
  component is hand-built

## Why it's built this way

Most beginner e-commerce projects stop at a flat product list with hardcoded data. This one
is built around a few decisions meant to make it feel closer to a real product:

- **A typed domain model, not just a form.** Products, orders, and cart items are modeled as
  proper TypeScript interfaces, with derived values (revenue, category totals, trend
  percentages) computed from raw orders rather than stored redundantly.
- **An async layer that behaves like a real API.** Every read and write has simulated
  latency and can fail, which forces the UI to handle loading and error states properly
  instead of assuming data is always there instantly.
- **Role-based auth**, not just a login screen. Customers and admins see different parts of
  the app, and the routing enforces it.
- **The two halves are actually connected.** An order placed in the storefront reduces
  stock and shows up in the dashboard's revenue and orders — they're not two separate
  demos glued together.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Recharts ·
lucide-react

## Getting started

```bash
npm install
npm run dev
```

The app seeds itself with several months of demo data on first load, so it's never empty.
Reset it anytime from **Settings** in the admin dashboard.

## Project structure

```
src/
  components/     Shared UI (cards, tables, modals, empty/error states, image fallback)
  context/        Auth, cart, theme, and a data-refresh signal used across the app
  data/           Seed data and static reference data (categories, pricing rules)
  hooks/          useAsync (data fetching with loading/error state), useLocalStorage
  layouts/        Route layouts and the auth guard
  lib/            The mock API, formatting helpers, shared class strings
  pages/          Storefront pages and admin pages
  types.ts        Domain types shared across the app
```