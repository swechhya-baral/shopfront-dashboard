import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getProducts, updateProductStock } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { useData } from "@/context/DataContext";
import { CATEGORY_LABELS, LOW_STOCK } from "@/data/products";
import { formatMoney } from "@/lib/format";
import { card, inputClass } from "@/lib/ui";
import type { Product } from "@/types";
import ProductImage from "@/components/ProductImage";
import { Badge } from "@/components/Badge";
import Skeleton from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";

const StockInput = ({ product }: { product: Product }) => {
  const { bump } = useData();
  const [value, setValue] = useState(String(product.stock));

  useEffect(() => {
    setValue(String(product.stock));
  }, [product.stock]);

  const commit = async () => {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 0) {
      setValue(String(product.stock));
      return;
    }
    if (next === product.stock) return;
    await updateProductStock(product.id, next);
    bump();
  };

  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      aria-label={`Stock for ${product.name}`}
      className="w-20 rounded-md border border-line bg-surface px-2 py-1 text-sm tabular-nums"
    />
  );
};

const Products = () => {
  const { data, error, loading, retry } = useAsync(getProducts);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Products</h1>

      <div className={card}>
        <div className="flex items-center justify-between gap-4 p-4">
          <p className="text-sm text-muted">Change a stock number and press Enter to save it.</p>
          <div className="relative w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
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
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No products found" description="Try a different search term." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-line text-xs text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 text-right font-medium">Price</th>
                  <th className="px-3 py-2.5 font-medium">Stock</th>
                  <th className="px-4 py-2.5 font-medium">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage category={p.category} color={p.color} src={p.image} alt={p.name} className="h-10 w-10 shrink-0 rounded-md" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted">{CATEGORY_LABELS[p.category]}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatMoney(p.price)}</td>
                    <td className="px-3 py-3">
                      <StockInput product={p} />
                    </td>
                    <td className="px-4 py-3">
                      {p.stock === 0 ? (
                        <Badge tone="bad">Out of stock</Badge>
                      ) : p.stock <= LOW_STOCK ? (
                        <Badge tone="warn">Low stock</Badge>
                      ) : (
                        <Badge tone="good">In stock</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
