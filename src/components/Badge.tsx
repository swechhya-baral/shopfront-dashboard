import type { ReactNode } from "react";
import type { OrderStatus } from "@/types";
import { STATUS_LABELS } from "@/data/delivery";

export type Tone = "good" | "warn" | "bad" | "info" | "muted";

export const Badge = ({ tone, children }: { tone: Tone; children: ReactNode }) => (
  <span
    className="inline-block rounded px-2 py-0.5 text-xs font-medium"
    style={{
      color: `var(--${tone})`,
      backgroundColor: `color-mix(in srgb, var(--${tone}) 14%, transparent)`,
    }}
  >
    {children}
  </span>
);

const STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: "warn",
  baking: "info",
  "out-for-delivery": "info",
  delivered: "good",
  cancelled: "bad",
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>
);
