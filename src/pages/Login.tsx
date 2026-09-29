import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { card, inputClass, primaryButton } from "@/lib/ui";
import Field from "@/components/Field";
import Logo from "@/components/Logo";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={from ?? "/"} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const signedIn = await login(email, password);
      navigate(from ?? (signedIn.role === "admin" ? "/admin" : "/"), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign you in.");
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
          <h1 className="text-xl font-bold">Sign in</h1>
          <Field label="Email" htmlFor="email">
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
          </Field>
          <Field label="Password" htmlFor="password">
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="current-password" />
          </Field>
          {error && (
            <p role="alert" className="text-sm text-bad">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} className={`${primaryButton} w-full py-2.5`}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/register" className="font-medium text-ink underline underline-offset-2">
            Create an account
          </Link>
        </p>

        <div className="mt-6 rounded-lg border border-dashed border-line p-4 text-sm text-muted">
          <p className="font-medium text-ink">Want to see the dashboard?</p>
          <p className="mt-1">
            Sign in as the demo admin: <span className="font-medium text-ink">admin@comfortcrumb.com</span> with
            password <span className="font-medium text-ink">admin123</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
