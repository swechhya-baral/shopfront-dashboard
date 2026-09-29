import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { card, inputClass, primaryButton } from "@/lib/ui";
import Field from "@/components/Field";
import Logo from "@/components/Logo";

const Register = () => {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address.");
    if (form.password.length < 6) return setError("Use at least 6 characters for your password.");
    if (form.password !== form.confirm) return setError("The two passwords don't match.");

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight">Comfort Crumb</span>
        </Link>

        <form onSubmit={handleSubmit} className={`${card} space-y-4 p-6`} noValidate>
          <h1 className="text-xl font-bold">Create an account</h1>
          <Field label="Full name" htmlFor="name">
            <input id="name" value={form.name} onChange={set("name")} className={inputClass} autoComplete="name" />
          </Field>
          <Field label="Email" htmlFor="email">
            <input id="email" type="email" value={form.email} onChange={set("email")} className={inputClass} autoComplete="email" />
          </Field>
          <Field label="Password" htmlFor="password">
            <input id="password" type="password" value={form.password} onChange={set("password")} className={inputClass} autoComplete="new-password" />
          </Field>
          <Field label="Confirm password" htmlFor="confirm">
            <input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} className={inputClass} autoComplete="new-password" />
          </Field>
          {error && (
            <p role="alert" className="text-sm text-bad">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} className={`${primaryButton} w-full py-2.5`}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ink underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
