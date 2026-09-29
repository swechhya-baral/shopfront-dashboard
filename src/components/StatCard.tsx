import { TrendingDown, TrendingUp } from "lucide-react";
import { card } from "@/lib/ui";

interface StatCardProps {
  label: string;
  value: string;
  /** Percent change against the previous period. null means there is nothing to compare. */
  change?: number | null;
  note?: string;
}

const StatCard = ({ label, value, change, note }: StatCardProps) => {
  const up = (change ?? 0) >= 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <div className={`${card} p-5`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {change !== undefined && change !== null && (
          <span className={`flex items-center gap-1 font-medium ${up ? "text-good" : "text-bad"}`}>
            <Icon size={13} />
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
        {note && <span className="text-muted">{note}</span>}
      </div>
    </div>
  );
};

export default StatCard;
