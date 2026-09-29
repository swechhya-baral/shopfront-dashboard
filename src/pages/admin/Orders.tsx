import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { useData } from "@/context/DataContext";
import { PAYMENT_LABELS, STATUS_LABELS } from "@/data/delivery";
import { formatDate, formatDay, formatMoney } from "@/lib/format";
import { card, inputClass } from "@/lib/ui";
import type { OrderStatus } from "@/types";
import Pagination from "@/components/Pagination";
import Skeleton from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const PAGE_SIZE = 8;
const STATUSES: OrderStatus[] = ["pending", "baking", "out-for-delivery", "delivered", "cancelled"];

const Orders = () => {
  const { data, error, loading, retry } = useAsync(getOrders);
  const { bump } = useData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: data?.length ?? 0 };
    for (const s of STATUSES) result[s] = data?.filter((o) => o.status === s).length ?? 0;
    return result;
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (!q || o.number.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
    );
  }, [data, query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const changeStatus = async (id: string, next: OrderStatus) => {
    await updateOrderStatus(id, next);
    bump();
  };

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Orders</h1>

      <div className={card}>
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  status === s ? "bg-brand text-on-brand" : "text-muted hover:bg-bg hover:text-ink"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABELS[s]} <span className="opacity-70">{counts[s]}</span>
              </button>
            ))}
          </div>
          <div className="relative lg:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by order or customer"
              aria-label="Search orders"
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>

        {error ? (
          <div className="p-4 pt-0">
            <ErrorState message={error} onRetry={retry} />
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4 pt-0">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No orders found" description="Try a different status or search term." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-line text-xs text-muted">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Order</th>
                    <th className="px-3 py-2.5 font-medium">Customer</th>
                    <th className="px-3 py-2.5 font-medium">Ordered</th>
                    <th className="px-3 py-2.5 font-medium">Deliver on</th>
                    <th className="px-3 py-2.5 font-medium">Payment</th>
                    <th className="px-3 py-2.5 text-right font-medium">Total</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3 font-medium">{o.number}</td>
                      <td className="px-3 py-3">
                        <p>{o.customerName}</p>
                        <p className="text-xs text-muted">{o.phone}</p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDate(o.createdAt)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDay(o.deliveryDate)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">{PAYMENT_LABELS[o.payment]}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{formatMoney(o.total)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                          aria-label={`Status for order ${o.number}`}
                          className="rounded-md border border-line bg-surface px-2 py-1 text-sm"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
};

export default Orders;
