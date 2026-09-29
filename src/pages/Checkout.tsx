import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useData } from "@/context/DataContext";
import { placeOrder } from "@/lib/api";
import { dayKey, formatDay, formatMoney } from "@/lib/format";
import { card, inputClass, primaryButton, secondaryButton } from "@/lib/ui";
import {
  FREE_DELIVERY_FROM,
  PAYMENT_LABELS,
  ZONE_FEES,
  ZONE_LABELS,
  deliveryFeeFor,
  earliestDelivery,
  latestDelivery,
} from "@/data/delivery";
import type { DeliveryZone, Order, PaymentMethod } from "@/types";
import Field from "@/components/Field";
import ProductImage from "@/components/ProductImage";

const ZONES: DeliveryZone[] = ["inner", "outer"];
const PAYMENTS: PaymentMethod[] = ["cod", "esewa", "khalti"];

const optionClass = (selected: boolean) =>
  `flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm ${
    selected ? "border-brand bg-brand-soft" : "border-line hover:bg-bg"
  }`;

const Checkout = () => {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const { bump } = useData();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    city: "",
    address: "",
  });
  const [zone, setZone] = useState<DeliveryZone>("inner");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const earliestKey = dayKey(earliestDelivery(items));
  const latestKey = dayKey(latestDelivery());
  const [date, setDate] = useState(earliestKey);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const deliveryFee = deliveryFeeFor(zone, subtotal);
  const total = subtotal + deliveryFee;

  if (placed) {
    return (
      <div className={`${card} mx-auto max-w-lg p-8 text-center`}>
        <h1 className="text-2xl font-bold">Thank you, your order is in</h1>
        <p className="mt-2 text-muted">
          Order {placed.number} will be delivered on {formatDay(placed.deliveryDate)}. We'll call {placed.phone} if we need anything to find you.
        </p>
        <p className="mt-4 text-lg font-bold">{formatMoney(placed.total)}</p>
        <p className="text-sm text-muted">{PAYMENT_LABELS[placed.payment]}</p>
        <Link to="/" className={`${primaryButton} mt-6`}>
          Keep shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${card} mx-auto max-w-lg`}>
        <div className="px-6 py-14 text-center">
          <p className="font-medium">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted">Add a few things first, then come back to check out.</p>
          <Link to="/" className={`${secondaryButton} mt-4`}>
            Go to the shop
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.city.trim() || !form.address.trim()) {
      setError("Fill in your name, city and street address.");
      return;
    }
    if (!/^9[678]\d{8}$/.test(form.phone.trim())) {
      setError("Enter a 10-digit Nepali mobile number, like 98XXXXXXXX.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!date || date < earliestKey || date > latestKey) {
      setError(`Pick a delivery date between ${formatDay(earliestKey)} and ${formatDay(latestKey)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const order = await placeOrder({
        customerName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        zone,
        payment,
        deliveryDate: date,
        address: form.address.trim(),
        city: form.city.trim(),
        items,
      });
      clear();
      bump();
      setPlaced(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't place the order. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className={`${card} space-y-6 p-6`} noValidate>
          <section className="space-y-4">
            <h2 className="font-bold">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="name">
                <input id="name" value={form.name} onChange={set("name")} className={inputClass} autoComplete="name" />
              </Field>
              <Field label="Mobile number" htmlFor="phone">
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  value={form.phone}
                  onChange={set("phone")}
                  className={inputClass}
                  autoComplete="tel"
                />
              </Field>
            </div>
            <Field label="Email" htmlFor="email">
              <input id="email" type="email" value={form.email} onChange={set("email")} className={inputClass} autoComplete="email" />
            </Field>
          </section>

          <section className="space-y-4">
            <h2 className="font-bold">Delivery</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {ZONES.map((z) => (
                <label key={z} className={optionClass(zone === z)}>
                  <input type="radio" name="zone" checked={zone === z} onChange={() => setZone(z)} className="accent-[var(--brand)]" />
                  <span className="flex-1">{ZONE_LABELS[z]}</span>
                  <span className="text-muted">{formatMoney(ZONE_FEES[z])}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted">Delivery is free on orders of {formatMoney(FREE_DELIVERY_FROM)} or more.</p>
            <Field label="Delivery date" htmlFor="date">
              <input
                id="date"
                type="date"
                min={earliestKey}
                max={latestKey}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-muted">
                {items.some((i) => i.leadDays > 0)
                  ? `Cakes need at least a day's notice, so the earliest date is ${formatDay(earliestKey)}.`
                  : "Everything is baked fresh that morning."}
              </p>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City or municipality" htmlFor="city">
                <input id="city" value={form.city} onChange={set("city")} className={inputClass} autoComplete="address-level2" />
              </Field>
              <Field label="Tole or street address" htmlFor="address">
                <input id="address" value={form.address} onChange={set("address")} className={inputClass} autoComplete="street-address" />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-bold">Payment</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {PAYMENTS.map((p) => (
                <label key={p} className={optionClass(payment === p)}>
                  <input type="radio" name="payment" checked={payment === p} onChange={() => setPayment(p)} className="accent-[var(--brand)]" />
                  {PAYMENT_LABELS[p]}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted">
              {payment === "cod"
                ? "Pay in cash when your order arrives."
                : `A real store would open ${PAYMENT_LABELS[payment]} here to confirm the payment. This demo skips that step.`}
            </p>
          </section>

          {error && (
            <p role="alert" className="text-sm text-bad">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className={`${primaryButton} w-full py-2.5`}>
            {submitting ? "Placing order..." : `Place order · ${formatMoney(total)}`}
          </button>
          <p className="text-xs text-muted">This is a demo store. No payment is collected.</p>
        </form>

        <aside className={`${card} h-fit p-6`}>
          <h2 className="mb-4 font-bold">Order summary</h2>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 py-3">
                <ProductImage
                  category={item.category}
                  color={item.color}
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 shrink-0 rounded-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatMoney(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{deliveryFee === 0 ? "Free" : formatMoney(deliveryFee)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
};

export default Checkout;
