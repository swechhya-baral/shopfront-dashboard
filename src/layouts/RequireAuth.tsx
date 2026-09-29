import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { secondaryButton } from "@/lib/ui";
import type { Role } from "@/types";

interface RequireAuthProps {
  role?: Role;
  children: ReactNode;
}

const RequireAuth = ({ role, children }: RequireAuthProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-bold">You don't have access to this page</h1>
        <p className="mt-2 text-sm text-muted">
          The dashboard is only for store admins. You're signed in as {user.email}.
        </p>
        <Link to="/" className={`${secondaryButton} mt-6`}>
          Back to the shop
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
