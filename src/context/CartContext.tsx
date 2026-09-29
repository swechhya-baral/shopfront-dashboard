import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import type { CartItem } from "@/types";
import { readJSON, writeJSON } from "@/lib/storage";

type CartAction =
  | { type: "add"; item: Omit<CartItem, "quantity"> }
  | { type: "setQty"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      const existing = state.find((i) => i.productId === action.item.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === existing.productId
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      }
      return [...state, { ...action.item, quantity: 1 }];
    }
    case "setQty":
      return state.map((i) =>
        i.productId === action.productId
          ? { ...i, quantity: Math.max(1, Math.min(action.quantity, i.stock)) }
          : i
      );
    case "remove":
      return state.filter((i) => i.productId !== action.productId);
    case "clear":
      return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "quantity">) => void;
  setQty: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [], () => readJSON<CartItem[]>("cc:cart") ?? []);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    writeJSON("cc:cart", items);
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      open,
      setOpen,
      add: (item) => dispatch({ type: "add", item }),
      setQty: (productId, quantity) => dispatch({ type: "setQty", productId, quantity }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items, open]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
