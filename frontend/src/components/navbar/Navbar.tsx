import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { getFirstName } from "../../types/NameHelpers";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { roles, isLoading, setRoles, isLoggingOut, setIsLoggingOut, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [animateState, setAnimateState] = useState<"entering" | "exiting" | null>(null);
  const allowedRoles = ["Admin"];
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      } else {
        console.error("Erro ao realizar logout.");
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  };

  const toggleDropdown = () => {
    if (isOpen) {
      // Começa animação de saída
      setAnimateState("exiting");
      // Fecha após a duração da animação
      setTimeout(() => {
        setIsOpen(false);
        setAnimateState(null);
      }, 200);
    } else {
      setIsOpen(true);
      setAnimateState("entering");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        if (isOpen) toggleDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 w-full bg-[#0F9D58] text-white shadow z-50">
        <div className="flex items-center justify-center py-3 px-8">
          <p className="animate-pulse">Carregando...</p>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#0F9D58] shadow-md z-50 border-b border-[#E6F4EA]">
      <div className="flex items-center justify-between py-2 px-6 max-w-7xl mx-auto">
        {/* Esquerda: Logo + Nome do Sistema */}
        <div className="flex items-center gap-2">
          <Link to="/home" className="flex items-center gap-2 group">
            <img
              src="/images/sicredi-logo.png"
              alt="Logo Sicredi"
              className="h-10 group-hover:scale-105 transition-transform"
              style={{ filter: "drop-shadow(0 2px 8px #e6f4ea88)" }}
            />
            <span
              className="text-2xl font-extrabold tracking-tight text-white select-none drop-shadow-[0_2px_6px_rgba(16,157,88,0.10)] font-['Poppins',sans-serif]"
            >
              Integra <span className="text-[#E6F4EA]">System</span>
            </span>
          </Link>
        </div>

        {/* Direita: Nome do usuário + Botão */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          {currentUser?.nome && (
            <span className="font-semibold text-white/90 px-4 py-1 rounded-xl bg-[#128C52]/10 border border-[#50d375]/40 shadow-sm">
              Olá, <span className="text-white">{getFirstName(currentUser.nome)}</span>!
            </span>
          )}

          <button
            onClick={toggleDropdown}
            className="p-2 rounded-xl border border-[#E6F4EA] bg-white text-[#0F9D58] hover:bg-[#E6F4EA] transition duration-150 shadow focus:outline-none flex items-center"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {isOpen && (
            <div
              className={`absolute top-[60px] right-0 w-56 bg-white border border-[#E6F4EA] rounded-2xl shadow-2xl z-50 overflow-hidden ${
                animateState === "entering"
                  ? "animate-dropdown-enter"
                  : animateState === "exiting"
                  ? "animate-dropdown-exit"
                  : ""
              }`}
              style={{ minWidth: "12rem" }}
            >
              {allowedRoles.some(role => roles.includes(role)) && (
                <button
                  onClick={() => {
                    navigate("/admin/manager");
                    toggleDropdown();
                  }}
                  className="flex items-center gap-2 w-full text-left px-5 py-3 text-[#128C52] hover:bg-[#E6F4EA] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Gerenciador
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition-colors"
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Saindo..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .animate-dropdown-enter {
          animation: dropdownEnter 0.22s ease forwards;
        }
        .animate-dropdown-exit {
          animation: dropdownExit 0.2s ease forwards;
        }
        @keyframes dropdownEnter {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dropdownExit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(12px) scale(0.95); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
