import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ProcessosInfinitePosts from "../../components/processos/informativos/ProcessosInfinitePosts";
import OrientadorGrid from "../../components/processos/orientador/OrientadorGrid";
import OrientadorTableEditor from "../../components/processos/orientador/OrientadorTableEditor";
import ProcessosSidebar from "../../components/processos/ProcessosSidebar";
import ProcessosColaboradores from "../../components/processos/colaboradores/ProcessosColaboradores"

const Processos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"informativos" | "orientador" | "colaboradores">("informativos");
  const [selectedButtonId, setSelectedButtonId] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-grow px-4 pt-20 pb-4 flex flex-col md:flex-row gap-4 items-start">
        {/* Sidebar */}
        <ProcessosSidebar activeTab={activeTab} setActiveTab={setActiveTab} setSelectedButtonId={setSelectedButtonId}></ProcessosSidebar>    

        {/* Painel Central */}
        <section className="flex-1 bg-white rounded-xl shadow border border-[#E6F4EA] p-6 overflow-auto">
          {activeTab === "informativos" && (
            <>
              {/* <h2 className="text-xl font-bold text-[#0F9D58] mb-4">Informativos</h2> */}
              <ProcessosInfinitePosts />
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
              <ProcessosColaboradores />
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

export default Processos;
