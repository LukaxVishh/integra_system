import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProps {
  roles: string[];
  setRoles: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading: boolean;
  resetLoading: () => void;
  isLoggingOut: boolean; // NOVO
  setIsLoggingOut: React.Dispatch<React.SetStateAction<boolean>>; // NOVO
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<string[]>([]);
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
        console.log("Roles carregadas:", data.roles); // Log para depuração
        setRoles(data.roles || []);
      } else {
        console.error("Erro ao buscar roles do usuário.");
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    } finally {
      setIsLoading(false);
      console.log("Carregamento concluído"); // Log para depuração
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
    <AuthContext.Provider value={{ roles, setRoles, isLoading, resetLoading, isLoggingOut, setIsLoggingOut }}>
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