import { Outlet } from "react-router-dom";
import StoreHeader from "@/components/StoreHeader";
import CartDrawer from "@/components/CartDrawer";

const StoreLayout = () => (
  <div className="min-h-screen">
    <StoreHeader />
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Outlet />
    </main>
    <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-sm text-muted sm:px-6">
      Comfort Crumb is a demo store. Nothing here is real and no payments are taken.
    </footer>
    <CartDrawer />
  </div>
);

export default StoreLayout;
