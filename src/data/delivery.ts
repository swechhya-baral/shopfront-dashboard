import type { DeliveryZone, OrderStatus, PaymentMethod } from "@/types";

export const FREE_DELIVERY_FROM = 2500;

export const ZONE_FEES: Record<DeliveryZone, number> = {
  inner: 100,
  outer: 200,
};

export const ZONE_LABELS: Record<DeliveryZone, string> = {
  inner: "Inside the Ring Road",
  outer: "Rest of Kathmandu Valley",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  esewa: "eSewa",
  khalti: "Khalti",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  baking: "Baking",
  "out-for-delivery": "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function deliveryFeeFor(zone: DeliveryZone, subtotal: number): number {
  return subtotal >= FREE_DELIVERY_FROM ? 0 : ZONE_FEES[zone];
}

/** The soonest day an order can be delivered, based on the slowest item in it. */
export function earliestDelivery(items: { leadDays: number }[]): Date {
  const lead = items.reduce((max, i) => Math.max(max, i.leadDays), 0);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + lead);
}

/** Orders can be booked up to a month ahead. */
export function latestDelivery(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
}
