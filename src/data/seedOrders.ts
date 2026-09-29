import type { DeliveryZone, Order, OrderStatus, PaymentMethod } from "@/types";
import { dayKey } from "@/lib/format";
import { PRODUCTS } from "./products";
import { deliveryFeeFor } from "./delivery";

// Small seeded random generator so the demo data looks the same on every fresh load.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Aarav", "Sita", "Bikash", "Anisha", "Rohan", "Sabina", "Prakash", "Nisha", "Suman", "Pooja", "Kiran", "Dipesh", "Manisha", "Sujan", "Rita", "Anil"];
const LAST = ["Sharma", "Thapa", "Shrestha", "Gurung", "Adhikari", "Karki", "Rai", "Tamang", "Bhandari", "Pandey", "Maharjan", "Basnet"];

const PLACES: Record<DeliveryZone, { cities: string[]; toles: string[] }> = {
  inner: {
    cities: ["Kathmandu", "Lalitpur"],
    toles: ["Baneshwor", "Lazimpat", "Jawalakhel", "Baluwatar", "Thamel", "Kupondole", "Maharajgunj", "Sanepa"],
  },
  outer: {
    cities: ["Bhaktapur", "Kirtipur", "Budhanilkantha", "Godawari"],
    toles: ["Suryabinayak", "Sallaghari", "Naikap", "Dhapasi", "Chapagaun"],
  },
};

function pick<T>(list: T[], rand: () => number): T {
  return list[Math.floor(rand() * list.length)];
}

// Bakery orders move fast: most are done within a day or two.
function statusFor(daysAgo: number, rand: () => number): OrderStatus {
  if (daysAgo > 2) return rand() < 0.06 ? "cancelled" : "delivered";
  if (daysAgo >= 1) return rand() < 0.8 ? "delivered" : "out-for-delivery";
  return rand() < 0.5 ? "pending" : "baking";
}

function paymentFor(rand: () => number): PaymentMethod {
  const r = rand();
  return r < 0.5 ? "cod" : r < 0.78 ? "esewa" : "khalti";
}

/** About six months of orders, ending today. */
export function buildSeedOrders(): Order[] {
  const rand = mulberry32(20260928);
  const now = new Date();
  const orders: Order[] = [];
  let counter = 1000;

  for (let daysAgo = 179; daysAgo >= 0; daysAgo--) {
    const growth = ((180 - daysAgo) / 180) * 0.9;
    const count = Math.floor(rand() * 2.2 + growth + 0.3);

    for (let i = 0; i < count; i++) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysAgo,
        8 + Math.floor(rand() * 12),
        Math.floor(rand() * 60)
      );
      if (date > now) continue;

      const picked = new Set<number>();
      const wanted = 1 + Math.floor(rand() * 3);
      while (picked.size < wanted) picked.add(Math.floor(rand() * PRODUCTS.length));

      const chosen = [...picked].map((index) => PRODUCTS[index]);
      const items = chosen.map((product) => ({
        productId: product.id,
        name: product.name,
        category: product.category,
        unitPrice: product.price,
        quantity: 1 + Math.floor(rand() * 2),
      }));

      // Delivery is on the earliest allowed day, or sometimes a day or two later.
      const lead = chosen.reduce((max, p) => Math.max(max, p.leadDays), 0);
      const extra = rand() < 0.3 ? 1 + Math.floor(rand() * 2) : 0;
      const deliveryDate = dayKey(
        new Date(date.getFullYear(), date.getMonth(), date.getDate() + lead + extra)
      );

      const zone: DeliveryZone = rand() < 0.7 ? "inner" : "outer";
      const places = PLACES[zone];
      const first = pick(FIRST, rand);
      const last = pick(LAST, rand);
      const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
      const deliveryFee = deliveryFeeFor(zone, subtotal);
      counter += 1;

      orders.push({
        id: `ord-seed-${counter}`,
        number: `CC-${counter}`,
        customerName: `${first} ${last}`,
        email: `${first}.${last}@example.com`.toLowerCase(),
        phone: `98${String(Math.floor(rand() * 1e8)).padStart(8, "0")}`,
        shipTo: `${pick(places.toles, rand)}, ${pick(places.cities, rand)}`,
        zone,
        payment: paymentFor(rand),
        createdAt: date.toISOString(),
        deliveryDate,
        status: statusFor(daysAgo, rand),
        items,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
      });
    }
  }

  return orders;
}
