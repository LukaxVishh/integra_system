import React from "react";

const Navbar: React.FC = () => {
  const handleLogout = () => {
    // Lógica para logout
    console.log("Usuário deslogado");
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