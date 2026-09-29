import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getOrders, getProducts } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { CATEGORY_COLORS, CATEGORY_LABELS, LOW_STOCK } from "@/data/products";
import { dayKey, formatDate, formatMoney, formatShortDay, percentChange } from "@/lib/format";
import { card } from "@/lib/ui";
import type { Category, Order } from "@/types";
import StatCard from "@/components/StatCard";
import { StatusBadge } from "@/components/Badge";
import Skeleton from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";

const RANGES = [7, 30, 90];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function periodStats(orders: Order[], from: Date, to: Date) {
  const list = orders.filter((o) => {
    const t = new Date(o.createdAt);
    return t >= from && t < to && o.status !== "cancelled";
  });
  const revenue = list.reduce((sum, o) => sum + o.subtotal, 0);
  return { list, revenue, count: list.length, average: list.length ? revenue / list.length : 0 };
}

const round = (n: number) => Math.round(n * 100) / 100;

const tooltipStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 13,
  color: "var(--ink)",
};

const Overview = () => {
  const [range, setRange] = useState(30);
  const orders = useAsync(getOrders);
  const products = useAsync(getProducts);

  const stats = useMemo(() => {
    if (!orders.data) return null;

    const today = startOfDay(new Date());
    const start = addDays(today, -(range - 1));
    const end = addDays(today, 1);
    const current = periodStats(orders.data, start, end);
    const previous = periodStats(orders.data, addDays(start, -range), start);

    const revenueByDay = new Map<string, number>();
    for (const order of current.list) {
      const key = dayKey(new Date(order.createdAt));
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + order.subtotal);
    }
    const series = Array.from({ length: range }, (_, i) => {
      const day = addDays(start, i);
      return { label: formatShortDay(day), revenue: round(revenueByDay.get(dayKey(day)) ?? 0) };
    });

    const byCategory = new Map<Category, number>();
    const byProduct = new Map<string, { name: string; units: number; revenue: number }>();
    for (const order of current.list) {
      for (const item of order.items) {
        const lineTotal = item.unitPrice * item.quantity;
        byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + lineTotal);
        const entry = byProduct.get(item.productId) ?? { name: item.name, units: 0, revenue: 0 };
        entry.units += item.quantity;
        entry.revenue += lineTotal;
        byProduct.set(item.productId, entry);
      }
    }

    const categories = [...byCategory.entries()]
      .map(([category, value]) => ({ category, name: CATEGORY_LABELS[category], value: round(value) }))
      .sort((a, b) => b.value - a.value);
    const top = [...byProduct.values()].sort((a, b) => b.units - a.units).slice(0, 5);

    return { current, previous, series, categories, top };
  }, [orders.data, range]);

  const lowStock = products.data ? products.data.filter((p) => p.stock <= LOW_STOCK).length : null;
  const error = orders.error ?? products.error;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <div className="flex gap-1 rounded-md border border-line bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-3 py-1 text-sm font-medium ${
                range === r ? "bg-brand text-on-brand" : "text-muted hover:text-ink"
              }`}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            orders.retry();
            products.retry();
          }}
        />
      ) : !stats || !orders.data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-80" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue"
              value={formatMoney(stats.current.revenue)}
              change={percentChange(stats.current.revenue, stats.previous.revenue)}
              note={`vs previous ${range} days`}
            />
            <StatCard
              label="Orders"
              value={String(stats.current.count)}
              change={percentChange(stats.current.count, stats.previous.count)}
              note={`vs previous ${range} days`}
            />
            <StatCard
              label="Average order"
              value={formatMoney(stats.current.average)}
              change={percentChange(stats.current.average, stats.previous.average)}
              note={`vs previous ${range} days`}
            />
            <StatCard
              label="Low-stock products"
              value={lowStock === null ? "–" : String(lowStock)}
              note={`${LOW_STOCK} or fewer units left`}
            />
          </div>

          <section className={`${card} p-5`}>
            <h2 className="mb-4 font-bold">Revenue</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.series} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "var(--muted)" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted)" }}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={(v: number) => (v >= 1000 ? `Rs ${v / 1000}k` : `Rs ${v}`)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [formatMoney(Number(value ?? 0)), "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--brand)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className={`${card} p-5`}>
              <h2 className="mb-4 font-bold">Sales by category</h2>
              {stats.categories.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">No sales in this period.</p>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="h-40 w-40 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.categories}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={44}
                          outerRadius={74}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {stats.categories.map((c) => (
                            <Cell key={c.category} fill={CATEGORY_COLORS[c.category]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatMoney(Number(value ?? 0))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="flex-1 space-y-2.5 text-sm">
                    {stats.categories.map((c) => (
                      <li key={c.category} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.category] }} />
                          {c.name}
                        </span>
                        <span className="text-muted">{formatMoney(c.value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className={`${card} p-5`}>
              <h2 className="mb-4 font-bold">Best sellers</h2>
              {stats.top.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">No sales in this period.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {stats.top.map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted">
                        {p.units} sold · {formatMoney(p.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className={card}>
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="font-bold">Latest orders</h2>
              <Link to="/admin/orders" className="text-sm font-medium text-brand hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-line text-xs text-muted">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">Order</th>
                    <th className="px-3 py-2.5 font-medium">Customer</th>
                    <th className="px-3 py-2.5 font-medium">Date</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-5 py-2.5 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.data.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td className="px-5 py-3 font-medium">{o.number}</td>
                      <td className="px-3 py-3">{o.customerName}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDate(o.createdAt)}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{formatMoney(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default Overview;
