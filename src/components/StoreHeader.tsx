import { Link, useNavigate } from "react-router-dom";
import { Moon, ShoppingBag, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { primaryButton } from "@/lib/ui";
import Logo from "./Logo";

const linkClass = "rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-ink";

const StoreHeader = () => {
  const { user, logout } = useAuth();
  const { count, setOpen } = useCart();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-bold tracking-tight">Comfort Crumb</span>
        </Link>

        <nav className="flex items-center gap-1">
          {user?.role === "admin" && (
            <Link to="/admin" className={linkClass}>
              Dashboard
            </Link>
          )}

          {user ? (
            <>
              <span className="hidden px-2 text-sm text-muted sm:inline">{user.name}</span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className={linkClass}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Sign in
              </Link>
              <Link to="/register" className={`${primaryButton} hidden sm:inline-flex`}>
                Create account
              </Link>
            </>
          )}

          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-bg hover:text-ink"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setOpen(true)}
            aria-label={`Open cart, ${count} items`}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-bg hover:text-ink"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-on-brand">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default StoreHeader;
