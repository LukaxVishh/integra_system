import React, { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { roles } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/home", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Carregando...</div>; // Exibe um indicador de carregamento
  }

  if (!isAuthenticated) {
    return <Navigate
        to="/"
        replace
        state={{ message: "Você precisa estar autenticado para acessar esta página." }}
      />;
  }

  // Se está autenticado, mas sem roles, força ir para /first-access
  if (roles.length === 0) {
    return <Navigate to="/first-access" replace />;
  }

  return children;
};

export default ProtectedRoute;