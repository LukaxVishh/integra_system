import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

interface RoleProtectedRouteProps {
  requiredRoles: string[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ requiredRoles }) => {
  const { roles, isLoading, isLoggingOut } = useAuth();

  if (isLoading || isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">Carregando...</p>
      </div>
    );
  }

  // Se não tem nenhuma role atribuída, redireciona para /first-access
  if (roles.length === 0) {
    return <Navigate to="/first-access" replace />;
  }

  // Verifica se o usuário possui pelo menos uma das roles necessárias
  const hasAccess = requiredRoles.some((role) => roles.includes(role));

  if (!hasAccess) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
