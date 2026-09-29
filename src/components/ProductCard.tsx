import type { Product } from "@/types";
import { CATEGORY_LABELS, LOW_STOCK } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";
import { card, primaryButton } from "@/lib/ui";
import ProductImage from "./ProductImage";

const ProductCard = ({ product }: { product: Product }) => {
  const { add, setOpen, items } = useCart();
  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const soldOut = product.stock === 0;
  const maxedOut = inCart >= product.stock;

  const handleAdd = () => {
    add({
      productId: product.id,
      name: product.name,
      category: product.category,
      color: product.color,
      image: product.image,
      price: product.price,
      leadDays: product.leadDays,
      stock: product.stock,
    });
    setOpen(true);
  };

  return (
    <article className={`${card} flex flex-col overflow-hidden`}>
      <ProductImage
        category={product.category}
        color={product.color}
        src={product.image}
        alt={product.name}
        className="aspect-square"
      />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-muted">
          {CATEGORY_LABELS[product.category]} · {product.unit}
        </p>
        <h3 className="mt-0.5 font-bold leading-snug">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>
        {product.leadDays > 0 && (
          <p className="mt-2 text-xs text-muted">
            Order at least {product.leadDays} day{product.leadDays > 1 ? "s" : ""} ahead
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-lg font-bold">{formatMoney(product.price)}</span>
            {!soldOut && product.stock <= LOW_STOCK && (
              <span className="text-xs font-medium text-warn">Only {product.stock} left today</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={soldOut || maxedOut}
            className={`${primaryButton} w-full`}
          >
            {soldOut ? "Sold out" : maxedOut ? "All in your cart" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
