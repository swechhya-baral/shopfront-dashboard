import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getProducts } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import { CATEGORY_LABELS } from "@/data/products";
import type { Category } from "@/types";
import { card, inputClass, secondaryButton } from "@/lib/ui";
import ProductCard from "@/components/ProductCard";
import Skeleton from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import Hero from "@/components/Hero";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

const Shop = () => {
  const { data, error, loading, retry } = useAsync(getProducts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<Sort>("featured");

  const visible = useMemo(() => {
    let list = data ?? [];
    if (category !== "all") list = list.filter((p) => p.category === category);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [data, query, category, sort]);

  const categories: (Category | "all")[] = ["all", "cakes", "breads", "pastries", "specials"];

  return (
    <>
      <Hero
        title="Comfort Crumb"
        subtitle="Cakes, breads and pastries baked fresh every morning. Savor the difference in every crumb!"
        src="/hero.jpg"
      />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                category === c
                  ? "border-brand bg-brand text-on-brand"
                  : "border-line bg-surface text-ink hover:bg-bg"
              }`}
            >
              {c === "all" ? "All" : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 md:w-56 md:flex-none">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort products"
            className={`${inputClass} w-auto`}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={`${card} overflow-hidden`}>
              <Skeleton className="aspect-square rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className={card}>
          <EmptyState
            title="Nothing matches that"
            description="Try a different search, or clear the category filter."
            action={
              <button
                className={secondaryButton}
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
              >
                Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
};

export default Shop;
