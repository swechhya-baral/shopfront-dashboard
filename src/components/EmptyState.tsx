import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="px-6 py-14 text-center">
    <p className="font-medium">{title}</p>
    <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
