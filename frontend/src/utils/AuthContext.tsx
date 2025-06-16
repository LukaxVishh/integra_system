// utils/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProps {
  roles: string[];
  setRoles: React.Dispatch<React.SetStateAction<string[]>>;
  currentUser: string | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  resetLoading: () => void;
  isLoggingOut: boolean;
  setIsLoggingOut: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchRoles = async () => {
    try {
      const response = await fetch("http://localhost:5000/users/roles", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Roles carregadas:", data.roles);
        setRoles(data.roles || []);

        // 👉 Se sua API devolver o nome do usuário:
        if (data.userName) {
          setCurrentUser(data.userName);
        }
      } else {
        console.error("Erro ao buscar roles do usuário.");
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const resetLoading = () => {
    setIsLoading(true);
    fetchRoles();
  };

  return (
    <AuthContext.Provider
      value={{
        roles,
        setRoles,
        currentUser,
        setCurrentUser,
        isLoading,
        resetLoading,
        isLoggingOut,
        setIsLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
