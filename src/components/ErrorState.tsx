import { secondaryButton } from "@/lib/ui";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div role="alert" className="rounded-lg border border-line bg-surface px-6 py-12 text-center">
    <p className="font-medium">We couldn't load this.</p>
    <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{message}</p>
    <button onClick={onRetry} className={`${secondaryButton} mt-4`}>
      Try again
    </button>
  </div>
);

export default ErrorState;
