import React, { createContext, useContext, useEffect, useState } from "react";

interface UserInfo {
  id: string;
  userName: string;
  email: string;
  nome: string;
  cargo: string;
  ua: string;
  claims: string[];
}

interface AuthContextProps {
  roles: string[];
  setRoles: React.Dispatch<React.SetStateAction<string[]>>;
  currentUser: UserInfo | null;  // ✅ objeto completo com claims
  setCurrentUser: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  isLoading: boolean;
  resetLoading: () => void;
  isLoggingOut: boolean;
  setIsLoggingOut: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchUserInfoAndRoles = async () => {
    try {
      // ✅ 1) Info + claims
      const userResponse = await fetch("http://localhost:5000/users/me", {
        method: "GET",
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("✅ Dados do usuário:", userData);
        setCurrentUser(userData);
      } else {
        console.error("❌ Erro ao buscar info do usuário");
      }

      // ✅ 2) Roles separadas, se quiser continuar usando para guards
      const rolesResponse = await fetch("http://localhost:5000/users/roles", {
        method: "GET",
        credentials: "include",
      });

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        console.log("✅ Roles:", rolesData.roles);
        setRoles(rolesData.roles || []);
      } else {
        console.error("❌ Erro ao buscar roles");
      }

    } catch (err) {
      console.error("❌ Erro de conexão:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfoAndRoles();
  }, []);

  const resetLoading = () => {
    setIsLoading(true);
    fetchUserInfoAndRoles();
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
