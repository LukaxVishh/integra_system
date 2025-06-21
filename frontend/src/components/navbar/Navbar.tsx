import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, LogOut, Settings } from "lucide-react";
import { useAuth } from "../../utils/AuthContext";
import { getFirstName } from "../../types/NameHelpers";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const {
    roles,
    isLoading,
    setRoles,
    isLoggingOut,
    setIsLoggingOut,
    currentUser,
    resetLoading,
  } = useAuth();

  const allowedRoles = ["Admin"];
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [animateMain, setAnimateMain] = useState<"entering" | "exiting" | null>(null);
  const [animatePhoto, setAnimatePhoto] = useState<"entering" | "exiting" | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | undefined>(currentUser?.photoUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const photoButtonRef = useRef<HTMLDivElement>(null);
  const photoDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser?.photoUrl) {
      setUserPhoto(currentUser.photoUrl);
    }
  }, [currentUser]);

  const toggleMainDropdown = () => {
    if (isMainOpen) {
      setAnimateMain("exiting");
      setTimeout(() => {
        setIsMainOpen(false);
        setAnimateMain(null);
      }, 200);
    } else {
      setIsMainOpen(true);
      setIsPhotoOpen(false);
      setAnimateMain("entering");
    }
  };

  const togglePhotoDropdown = () => {
    if (isPhotoOpen) {
      setAnimatePhoto("exiting");
      setTimeout(() => {
        setIsPhotoOpen(false);
        setAnimatePhoto(null);
      }, 200);
    } else {
      setIsPhotoOpen(true);
      setIsMainOpen(false);
      setAnimatePhoto("entering");
    }
  };

  // ✅ Clique fora: fecha ambos se clicar fora de tudo
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      const clickedMain = dropdownRef.current?.contains(target);
      const clickedPhotoBtn = photoButtonRef.current?.contains(target);
      const clickedPhotoDropdown = photoDropdownRef.current?.contains(target);

      if (!clickedMain && !clickedPhotoBtn && !clickedPhotoDropdown) {
        if (isMainOpen) toggleMainDropdown();
        if (isPhotoOpen) togglePhotoDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMainOpen, isPhotoOpen]);

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

  const handleUploadPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append("File", file);
    try {
      const res = await fetch(`http://localhost:5000/users/${currentUser?.id}/photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      setUserPhoto(data.photoUrl);
      resetLoading();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await fetch(`http://localhost:5000/users/${currentUser?.id}/photo`, {
        method: "DELETE",
        credentials: "include",
      });
      setUserPhoto(undefined);
      resetLoading();
    } catch (err) {
      console.error(err);
    }
  };

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
        {/* Logo + Nome */}
        <div className="flex items-center gap-2">
          <Link to="/home" className="flex items-center gap-2 group">
            <img
              src="/images/sicredi-logo.png"
              alt="Logo Sicredi"
              className="h-10 group-hover:scale-105 transition-transform"
              style={{ filter: "drop-shadow(0 2px 8px #e6f4ea88)" }}
            />
            <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow font-['Poppins',sans-serif]">
              Integra <span className="text-[#E6F4EA]">System</span>
            </span>
          </Link>
        </div>

        {/* Usuário + Foto + Menus */}
        <div className="flex items-center gap-3 relative">
          <div
            className="flex items-center gap-2 px-4 py-1 rounded-xl bg-[#128C52]/10 border border-[#50d375]/40 shadow-sm cursor-pointer reflect-container"
            onClick={togglePhotoDropdown}
            ref={photoButtonRef}
          >
            <span className="font-semibold text-white">
              Olá, {getFirstName(currentUser?.nome || "")}!
            </span>
            <div className="w-8 h-8 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#0F9D58] font-bold text-sm overflow-hidden border-2 border-[#0F9D58]">
              {userPhoto ? (
                <img src={`http://localhost:5000/${userPhoto}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getFirstName(currentUser?.nome || "")[0]
              )}
            </div>
          </div>

          <button
            onClick={toggleMainDropdown}
            className="p-2 rounded-xl border border-[#E6F4EA] bg-white text-[#0F9D58] hover:bg-[#E6F4EA] transition shadow flex items-center"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Main Dropdown */}
          {isMainOpen && (
            <div
              ref={dropdownRef}
              className={`absolute top-[60px] right-0 w-56 bg-white border border-[#E6F4EA] rounded-2xl shadow-2xl z-50 overflow-hidden ${
                animateMain === "entering"
                  ? "animate-dropdown-enter"
                  : animateMain === "exiting"
                  ? "animate-dropdown-exit"
                  : ""
              }`}
            >
              {allowedRoles.some((role) => roles.includes(role)) && (
                <button
                  onClick={() => {
                    navigate("/admin/manager");
                    toggleMainDropdown();
                  }}
                  className="flex items-center gap-2 w-full text-left px-5 py-3 text-[#128C52] hover:bg-[#E6F4EA] transition-colors text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Gerenciador
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 hover:scale-[1.02] transition text-sm cursor-pointer"
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Saindo..." : "Logout"}
              </button>
            </div>
          )}

          {/* Foto Dropdown */}
          {isPhotoOpen && (
            <div
              ref={photoDropdownRef}
              className={`absolute top-[60px] right-[70px] w-52 bg-white border border-[#E6F4EA] rounded-2xl shadow-2xl z-50 overflow-hidden ${
                animatePhoto === "entering"
                  ? "animate-dropdown-enter"
                  : animatePhoto === "exiting"
                  ? "animate-dropdown-exit"
                  : ""
              }`}
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 w-full px-4 py-2 text-[#128C52] hover:bg-[#E6F4EA]/50 transition text-sm"
              >
                {/* Novo SVG Trocar Foto */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                Trocar Foto
              </button>
              <button
                onClick={handleRemovePhoto}
                className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition text-sm"
              >
                {/* Novo SVG Remover Foto */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="2" x2="22" y1="2" y2="22" />
                  <path d="M7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16"/>
                  <path d="M9.5 4h5L17 7h3a2 2 0 0 1 2 2v7.5"/>
                  <path d="M14.121 15.121A3 3 0 1 1 9.88 10.88"/>
                </svg>
                Remover Foto
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files?.[0]) handleUploadPhoto(e.target.files[0]);
            }}
          />
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

        .reflect-container {
          position: relative;
          overflow: hidden;
        }
        .reflect-container::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%) rotate(25deg);
          opacity: 0;
        }
        .reflect-container:hover::before {
          animation: shine 1.5s forwards;
          opacity: 1;
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(100%) rotate(25deg); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
