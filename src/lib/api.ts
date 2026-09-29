import type { CheckoutInput, Order, OrderStatus, Product } from "@/types";
import { PRODUCTS } from "@/data/products";
import { deliveryFeeFor, earliestDelivery } from "@/data/delivery";
import { buildSeedOrders } from "@/data/seedOrders";
import { dayKey, formatDay } from "./format";
import { readJSON, removeKey, writeJSON } from "./storage";

/**
 * A pretend backend. Everything lives in localStorage, but every call is async and
 * has latency (and can fail on purpose), so the UI has to deal with loading and
 * error states the way it would against a real API.
 */

const KEYS = {
  products: "cc:products",
  orders: "cc:orders",
  failureRate: "cc:failure-rate",
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const latency = () => wait(300 + Math.random() * 400);

function load<T>(key: string, seed: () => T): T {
  const stored = readJSON<T>(key);
  if (stored) return stored;
  const fresh = seed();
  writeJSON(key, fresh);
  return fresh;
}

export function getFailureRate(): number {
  return readJSON<number>(KEYS.failureRate) ?? 0;
}

export function setFailureRate(rate: number): void {
  writeJSON(KEYS.failureRate, rate);
}

async function read<T>(query: () => T): Promise<T> {
  await latency();
  const rate = getFailureRate();
  if (rate > 0 && Math.random() < rate) {
    throw new Error("The request failed. Check your connection and try again.");
  }
  return query();
}

export function getProducts(): Promise<Product[]> {
  return read(() => load(KEYS.products, () => PRODUCTS));
}

export function getOrders(): Promise<Order[]> {
  return read(() =>
    [...load(KEYS.orders, buildSeedOrders)].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export async function placeOrder(input: CheckoutInput): Promise<Order> {
  await latency();
  const products = load(KEYS.products, () => PRODUCTS);
  const orders = load(KEYS.orders, buildSeedOrders);

  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`${item.name} is no longer available.`);
    if (product.stock < item.quantity) {
      throw new Error(
        product.stock === 0
          ? `${product.name} just sold out.`
          : `Only ${product.stock} of ${product.name} left. Lower the quantity and try again.`
      );
    }
  }

  const earliest = dayKey(earliestDelivery(input.items));
  if (input.deliveryDate < earliest) {
    throw new Error(`The earliest delivery date for this order is ${formatDay(earliest)}.`);
  }

  const updatedProducts = products.map((p) => {
    const line = input.items.find((i) => i.productId === p.id);
    return line ? { ...p, stock: p.stock - line.quantity } : p;
  });

  const lastNumber = Math.max(1000, ...orders.map((o) => Number(o.number.replace("CC-", "")) || 0));
  const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = deliveryFeeFor(input.zone, subtotal);

  const order: Order = {
    id: `ord-${Date.now()}`,
    number: `CC-${lastNumber + 1}`,
    customerName: input.customerName,
    email: input.email,
    phone: input.phone,
    shipTo: `${input.address}, ${input.city}`,
    zone: input.zone,
    payment: input.payment,
    createdAt: new Date().toISOString(),
    deliveryDate: input.deliveryDate,
    status: "pending",
    items: input.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      category: i.category,
      unitPrice: i.price,
      quantity: i.quantity,
    })),
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };

  writeJSON(KEYS.products, updatedProducts);
  writeJSON(KEYS.orders, [order, ...orders]);
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await wait(150);
  const orders = load(KEYS.orders, buildSeedOrders);
  writeJSON(KEYS.orders, orders.map((o) => (o.id === id ? { ...o, status } : o)));
}

export async function updateProductStock(id: string, stock: number): Promise<void> {
  await wait(150);
  const products = load(KEYS.products, () => PRODUCTS);
  writeJSON(KEYS.products, products.map((p) => (p.id === id ? { ...p, stock } : p)));
}

export function resetDemoData(): void {
  removeKey(KEYS.products);
  removeKey(KEYS.orders);
}
