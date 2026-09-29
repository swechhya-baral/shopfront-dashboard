import { Route, Routes } from "react-router-dom";
import StoreLayout from "@/layouts/StoreLayout";
import AdminLayout from "@/layouts/AdminLayout";
import RequireAuth from "@/layouts/RequireAuth";
import Shop from "@/pages/Shop";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Overview from "@/pages/admin/Overview";
import Orders from "@/pages/admin/Orders";
import Products from "@/pages/admin/Products";
import Settings from "@/pages/admin/Settings";

const App = () => (
  <Routes>
    <Route element={<StoreLayout />}>
      <Route index element={<Shop />} />
      <Route
        path="checkout"
        element={
          <RequireAuth>
            <Checkout />
          </RequireAuth>
        }
      />
    </Route>

    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />

    <Route
      path="admin"
      element={
        <RequireAuth role="admin">
          <AdminLayout />
        </RequireAuth>
      }
    >
      <Route index element={<Overview />} />
      <Route path="orders" element={<Orders />} />
      <Route path="products" element={<Products />} />
      <Route path="settings" element={<Settings />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
