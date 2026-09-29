import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Moon, Package, Receipt, Settings, Store, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/Logo";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: Receipt, end: false },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
      isActive ? "bg-white/10 text-white" : "text-sidebar-ink hover:bg-white/5 hover:text-white"
    }`;

  const footerButton =
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-ink hover:bg-white/5 hover:text-white";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 bg-sidebar p-4 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:gap-6">
        <Link to="/admin" className="flex items-center gap-2.5 px-1">
          <Logo bg="#f3e3ea" fg="#2b1622" />
          <span className="font-bold tracking-tight text-white">Comfort Crumb</span>
        </Link>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={itemClass}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden flex-col gap-1 border-t border-white/10 pt-4 lg:mt-auto lg:flex">
          <Link to="/" className={footerButton}>
            <Store size={17} />
            View store
          </Link>
          <button onClick={toggle} className={footerButton}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className={footerButton}
          >
            <LogOut size={17} />
            Sign out
          </button>
          <p className="truncate px-3 pt-2 text-xs text-sidebar-ink">{user?.email}</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
