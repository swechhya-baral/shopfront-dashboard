export type Category = "cakes" | "breads" | "pastries" | "specials";

export interface Product {
  id: string;
  name: string;
  category: Category;
  /** Price in Nepali rupees. */
  price: number;
  /** Size or pack shown next to the name, e.g. "1 lb" or "box of 6". */
  unit: string;
  /** How many units are baked for the day. */
  stock: number;
  /** Days of notice needed before delivery. Cakes need 1, everything else can be same day. */
  leadDays: number;
  /** Fallback tint and illustration colour when the photo is missing. */
  color: string;
  /** Path under /public, e.g. "/products/banana-bread.jpg". */
  image: string;
  description: string;
}

export interface CartItem {
  productId: string;
  name: string;
  category: Category;
  color: string;
  image: string;
  price: number;
  leadDays: number;
  quantity: number;
  /** Stock at the time the item was added; re-checked again at checkout. */
  stock: number;
}

export type OrderStatus =
  | "pending"
  | "baking"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

/** inner = inside the Ring Road, outer = the rest of Kathmandu Valley. */
export type DeliveryZone = "inner" | "outer";
export type PaymentMethod = "cod" | "esewa" | "khalti";

export interface OrderItem {
  productId: string;
  name: string;
  category: Category;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  number: string;
  customerName: string;
  email: string;
  phone: string;
  shipTo: string;
  zone: DeliveryZone;
  payment: PaymentMethod;
  createdAt: string; // ISO timestamp
  /** The day the customer wants it, as YYYY-MM-DD. */
  deliveryDate: string;
  status: OrderStatus;
  items: OrderItem[];
  /** Sum of the items, before delivery. */
  subtotal: number;
  deliveryFee: number;
  /** subtotal + deliveryFee */
  total: number;
}

export type Role = "admin" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface StoredUser extends User {
  password: string;
}

export interface CheckoutInput {
  customerName: string;
  email: string;
  phone: string;
  zone: DeliveryZone;
  payment: PaymentMethod;
  deliveryDate: string;
  address: string;
  city: string;
  items: CartItem[];
}
