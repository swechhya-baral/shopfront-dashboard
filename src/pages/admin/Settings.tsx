import { useState } from "react";
import { getFailureRate, resetDemoData, setFailureRate } from "@/lib/api";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { card, secondaryButton } from "@/lib/ui";

const Row = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-6 px-5 py-4">
    <div>
      <p className="font-medium">{title}</p>
      <p className="mt-0.5 text-sm text-muted">{description}</p>
    </div>
    {children}
  </div>
);

const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative h-6 w-11 shrink-0 rounded-full ${checked ? "bg-brand" : "bg-line"}`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] ${checked ? "left-[22px]" : "left-0.5"}`}
    />
  </button>
);

const Settings = () => {
  const { theme, toggle } = useTheme();
  const { bump } = useData();
  const [errorsOn, setErrorsOn] = useState(() => getFailureRate() > 0);

  const toggleErrors = () => {
    const next = !errorsOn;
    setFailureRate(next ? 0.35 : 0);
    setErrorsOn(next);
  };

  const reset = () => {
    if (window.confirm("Reset all products and orders back to the demo data?")) {
      resetDemoData();
      bump();
    }
  };

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Settings</h1>
      <div className={`${card} max-w-2xl divide-y divide-line`}>
        <Row title="Dark mode" description="Switch the whole app between light and dark.">
          <Switch checked={theme === "dark"} onChange={toggle} label="Dark mode" />
        </Row>
        <Row
          title="Simulate network errors"
          description="Roughly a third of data requests will fail, so you can check the error states and retry buttons."
        >
          <Switch checked={errorsOn} onChange={toggleErrors} label="Simulate network errors" />
        </Row>
        <Row title="Reset demo data" description="Restore the original products, stock levels and orders.">
          <button onClick={reset} className={secondaryButton}>
            Reset
          </button>
        </Row>
      </div>
    </>
  );
};

export default Settings;
