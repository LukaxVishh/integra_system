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
          <div className="col-span-3 row-span-3 col-start-2 row-start-2 bg-green-200 border-4 border-green-700 rounded-lg p-6 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-green-500-600 mb-4">Integra System</h1>
            <p className="text-green-600-600 text-center">
              Bem vindo ao Integra System! Esta é uma plataforma da nossa cooperativa, envie o print dessa tela a área de Processos e Qualidade e solicite seus acessos.
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