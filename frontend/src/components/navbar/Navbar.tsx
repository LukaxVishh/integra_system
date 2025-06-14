import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../utils/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { roles, isLoading, setRoles, isLoggingOut, setIsLoggingOut } = useAuth(); // Usa o contexto global
  const [isOpen, setIsOpen] = useState(false);
  const allowedRoles = ["Admin", "Gerente CA"];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("http://localhost:5000/account/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setTimeout(() => {
          setRoles([]);
          setIsLoggingOut(false);
        }, 100);
        navigate("/", { replace: true });
        return;
      } else {
        console.error("Erro ao realizar logout.");
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    } 
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleGerenciador = () => {
    navigate("/admin/manager");
    setIsOpen(false);
  };

  if (isLoading) {
    // Exibe um indicador de carregamento enquanto as roles estão sendo carregadas
    return (
      <nav className="fixed top-0 left-0 w-full bg-green-600 text-white shadow z-50">
        <div className="flex items-center justify-center py-2 px-6">
          <p>Carregando...</p>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-green-600 text-white shadow z-50">
      <div className="flex items-center justify-between py-2 px-6">
        <Link to="/home">
          <img src="/images/sicredi-logo.png" alt="Logo" className="h-12 hover:opacity-80 transition-opacity" />
        </Link>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="p-2 rounded-lg border border-white hover:bg-white hover:text-green-600 transition-colors duration-200 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50">
              {/* Renderizar o botão "Gerenciador" apenas para usuários com a role "Admin" */}
              {allowedRoles.some(role => roles.includes(role)) && (
                <button
                  onClick={handleGerenciador}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                  Gerenciador
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-100 text-red-600"
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Saindo..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
};

export default Navbar;