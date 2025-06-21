import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ControlesInternosInfinitePosts from "../../components/controles_internos/informativos/ControlesInternosInfinitePosts";
import OrientadorGrid from "../../components/controles_internos/orientador/OrientadorGrid";
import OrientadorTableEditor from "../../components/controles_internos/orientador/OrientadorTableEditor";
import ControlesInternosSidebar from "../../components/controles_internos/ControlesInternosSidebar";
import ControlesInternosColaboradores from "../../components/controles_internos/colaboradores/ControlesInternosColaboradores"

const ControlesInternos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"informativos" | "orientador" | "colaboradores">("informativos");
  const [selectedButtonId, setSelectedButtonId] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-grow px-4 pt-20 pb-4 flex flex-col md:flex-row gap-4 items-start">
        {/* Sidebar */}
        <ControlesInternosSidebar activeTab={activeTab} setActiveTab={setActiveTab} setSelectedButtonId={setSelectedButtonId}></ControlesInternosSidebar>    

        {/* Painel Central */}
        <section className="flex-1 bg-white rounded-xl shadow border border-[#E6F4EA] p-6 overflow-auto">
          {activeTab === "informativos" && (
            <>
              {/* <h2 className="text-xl font-bold text-[#0F9D58] mb-4">Informativos</h2> */}
              <ControlesInternosInfinitePosts />
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
              <ControlesInternosColaboradores />
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

export default ControlesInternos;
