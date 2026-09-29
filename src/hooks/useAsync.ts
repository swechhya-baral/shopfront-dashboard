import { useCallback, useEffect, useState } from "react";
import { useData } from "@/context/DataContext";

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
}

/**
 * Runs an async function on mount and again whenever data changes elsewhere in the
 * app (see DataContext). Old data stays on screen while a refetch is running, so
 * tables don't flash back to skeletons after every edit.
 *
 * Pass a stable function (a module-level one), not an inline arrow.
 */
export function useAsync<T>(fetcher: () => Promise<T>): AsyncState<T> {
  const { revision } = useData();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, revision, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return {
    data,
    error: data === null ? error : null,
    loading: data === null && error === null,
    retry,
  };
}
