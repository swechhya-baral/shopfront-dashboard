import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface DataContextValue {
  revision: number;
  /** Call after changing data so every screen that reads it refetches. */
  bump: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);
  const bump = useCallback(() => setRevision((n) => n + 1), []);
  const value = useMemo(() => ({ revision, bump }), [revision, bump]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
