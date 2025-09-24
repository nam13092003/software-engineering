import type { CSSProperties } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  children: JSX.Element;
}

export function ProtectedRoute({ allowedRoles, redirectTo = "/login", children }: ProtectedRouteProps) {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/books" replace />;
  }

  return children;
}

const styles: Record<string, CSSProperties> = {
  loading: {
    padding: "2rem",
    textAlign: "center"
  }
};
