import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/account/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Redireciona para a página de login (raiz)
        navigate("/", { replace: true });
      } else {
        console.error("Erro ao realizar logout.");
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-green-600 text-white">
      <div className="flex items-center justify-between py-1 px-6">
        <img src="../images/sicredi-logo.png" alt="Logo" className="h-12" />
        <button
          onClick={handleLogout}
          className="bg-white hover:bg-red-500 text-red-500 font-semibold hover:text-white py-1 px-4 border border-red-500 hover:border-transparent rounded-full"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;