import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import CicloInfinitePosts from "../../components/ciclo_credito/informativos/CicloInfinitePosts";
import OrientadorGrid from "../../components/ciclo_credito/orientador/OrientadorGrid";
import OrientadorTableEditor from "../../components/ciclo_credito/orientador/OrientadorTableEditor";

const CicloCredito: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"informativos" | "orientador" | "colaboradores" | null>(null);
  const [selectedButtonId, setSelectedButtonId] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-grow px-4 pt-20 pb-4 flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <aside className="w-full md:w-1/5 bg-white rounded-xl shadow border border-[#E6F4EA] p-4">
          <h2 className="text-lg font-bold text-[#0F9D58] mb-4">Ciclo de Crédito</h2>
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full px-4 py-2 rounded-md ${
                  activeTab === "informativos"
                    ? "bg-[#0F9D58]"
                    : "bg-[#128C52] hover:bg-[#0F9D58]"
                } text-white`}
                onClick={() => {
                  setActiveTab("informativos");
                  setSelectedButtonId(null);
                }}
              >
                Informativos
              </button>
            </li>
            <li>
              <button
                className={`w-full px-4 py-2 rounded-md ${
                  activeTab === "orientador"
                    ? "bg-[#0F9D58]"
                    : "bg-[#128C52] hover:bg-[#0F9D58]"
                } text-white`}
                onClick={() => {
                  setActiveTab("orientador");
                  setSelectedButtonId(null);
                }}
              >
                Orientador
              </button>
            </li>
            <li>
              <button
                className={`w-full px-4 py-2 rounded-md ${
                  activeTab === "colaboradores"
                    ? "bg-[#0F9D58]"
                    : "bg-[#128C52] hover:bg-[#0F9D58]"
                } text-white`}
                onClick={() => {
                  setActiveTab("colaboradores");
                  setSelectedButtonId(null);
                }}
              >
                Colaboradores
              </button>
            </li>
          </ul>
        </aside>

        {/* Painel Central */}
        <section className="flex-1 bg-white rounded-xl shadow border border-[#E6F4EA] p-6 overflow-auto">
          {activeTab === "informativos" && (
            <>
              <h2 className="text-xl font-bold text-[#0F9D58] mb-4">Informativos</h2>
              <CicloInfinitePosts />
            </>
          )}

          {activeTab === "orientador" && (
            <>
              <h2 className="text-xl font-bold text-[#0F9D58] mb-4">Orientador</h2>

              {/* Se um botão estiver selecionado, mostra editor de tabela */}
              {selectedButtonId ? (
                <OrientadorTableEditor buttonId={selectedButtonId} />
              ) : (
                <OrientadorGrid onButtonClick={(id) => setSelectedButtonId(id)} />
              )}
            </>
          )}

          {activeTab === "colaboradores" && (
            <>
              <h2 className="text-xl font-bold text-[#0F9D58] mb-4">Colaboradores</h2>
              <p className="text-gray-700">
                Aqui vai o conteúdo relacionado aos colaboradores envolvidos no Ciclo de Crédito.
              </p>
            </>
          )}

          {!activeTab && (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">Selecione uma opção no menu</span>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CicloCredito;
