import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";
import { primaryButton } from "@/lib/ui";
import ProductImage from "./ProductImage";

const qtyButton =
  "flex h-7 w-7 items-center justify-center rounded-md border border-line hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40";

const CartDrawer = () => {
  const { items, open, setOpen, setQty, remove, subtotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-surface"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-bold">Your cart</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-bg"
          >
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-medium">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted">Add something from the shop and it will show up here.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-4">
                  <ProductImage
                    category={item.category}
                    color={item.color}
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-md"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium leading-tight">{item.name}</p>
                      <p className="font-medium">{formatMoney(item.price * item.quantity)}</p>
                    </div>
                    <p className="text-sm text-muted">{formatMoney(item.price)} each</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          className={qtyButton}
                          onClick={() => setQty(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          className={qtyButton}
                          onClick={() => setQty(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.productId)}
                        className="text-sm text-muted underline underline-offset-2 hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-4">
              <div className="mb-4 flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-bold">{formatMoney(subtotal)}</span>
              </div>
              <button
                className={`${primaryButton} w-full py-2.5`}
                onClick={() => {
                  setOpen(false);
                  navigate("/checkout");
                }}
              >
                Go to checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
