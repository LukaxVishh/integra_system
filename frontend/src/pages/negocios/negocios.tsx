import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import NegociosInfinitePosts from "../../components/negocios/informativos/NegociosInfinitePosts";
import OrientadorGrid from "../../components/negocios/orientador/OrientadorGrid";
import OrientadorTableEditor from "../../components/negocios/orientador/OrientadorTableEditor";
import NegociosSidebar from "../../components/negocios/NegociosSidebar";
import NegociosColaboradores from "../../components/negocios/colaboradores/NegociosColaboradores"

const Negocios: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"informativos" | "orientador" | "colaboradores">("informativos");
  const [selectedButtonId, setSelectedButtonId] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-grow px-4 pt-20 pb-4 flex flex-col md:flex-row gap-4 items-start">
        {/* Sidebar */}
        <NegociosSidebar activeTab={activeTab} setActiveTab={setActiveTab} setSelectedButtonId={setSelectedButtonId}></NegociosSidebar>    

        {/* Painel Central */}
        <section className="flex-1 bg-white rounded-xl shadow border border-[#E6F4EA] p-6 overflow-auto">
          {activeTab === "informativos" && (
            <>
              <NegociosInfinitePosts />
            </>
          )}

          {activeTab === "orientador" && (
            <>
              <h2 className="text-xl font-bold text-[#0F9D58] mb-4">Orientador</h2>

              {/* Se um botão estiver selecionado, mostra editor de tabela */}
              {selectedButtonId ? (
                <OrientadorTableEditor buttonId={selectedButtonId} onClose={() => setSelectedButtonId(null)}/>
              ) : (
                <OrientadorGrid onButtonClick={(id) => setSelectedButtonId(id)} />
              )}
            </>
          )}

          {activeTab === "colaboradores" && (
            <>
              <h2 className="text-xl font-bold text-[#0F9D58] mb-4">Colaboradores</h2>
              <NegociosColaboradores />
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

export default Negocios;
