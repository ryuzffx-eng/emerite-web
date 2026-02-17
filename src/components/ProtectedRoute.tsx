import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getAuth } from "@/lib/api";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredType?: "admin" | "reseller" | "client";
}

export const ProtectedRoute = ({ children, requiredType }: ProtectedRouteProps) => {
  try {
    if (!isAuthenticated()) {
      return <Navigate to="/" replace />;
    }

    const auth = getAuth();
    if (requiredType && auth?.userType !== requiredType) {
      console.warn(`[ProtectedRoute] User of type ${auth?.userType} attempted to access ${requiredType} route`);
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("[ProtectedRoute] Error:", error);
    return <Navigate to="/" replace />;
  }
};
