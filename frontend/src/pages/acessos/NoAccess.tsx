import React from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

const AccessDenied: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Conteúdo principal */}
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="grid grid-cols-5 grid-rows-5 gap-4 w-full max-w-4xl">
          <div className="col-span-3 row-span-3 col-start-2 row-start-2 bg-green-100 border-1 border-green-700 rounded-lg p-6 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
            <p className="text-red-500 font-bold text-center">
              Você não possui permissão para acessar esta página. Entre em contato com o administrador do sistema para mais informações.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AccessDenied;