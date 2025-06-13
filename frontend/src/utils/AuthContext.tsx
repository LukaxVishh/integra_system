import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProps {
  roles: string[];
  setRoles: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/roles", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles); // Supondo que o backend retorna um array de roles
        } else {
          console.error("Erro ao buscar roles do usuário.");
        }
      } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
      } finally {
        setIsLoading(false); // Finaliza o carregamento
      }
    };

    fetchRoles();
  }, []);

  return (
    <AuthContext.Provider value={{ roles, setRoles, isLoading }}>
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