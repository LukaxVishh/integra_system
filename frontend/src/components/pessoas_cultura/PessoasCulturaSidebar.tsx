import { BookOpenIcon, ClipboardIcon, UsersIcon, IdentificationIcon } from "@heroicons/react/24/outline";

interface PessoasCulturaSidebarProps {
  activeTab: "informativos" | "orientador" | "colaboradores";
  setActiveTab: (tab: "informativos" | "orientador" | "colaboradores") => void;
  setSelectedButtonId: (id: number | null) => void;
}

const PessoasCulturaSidebar: React.FC<PessoasCulturaSidebarProps> = ({ activeTab, setActiveTab, setSelectedButtonId }) => (
  <aside className="inline-block bg-white rounded-2xl shadow p-4 border border-[#E6F4EA] w-72">
    <div className="flex items-center gap-2 mb-4">
      <IdentificationIcon className="w-5 h-5 text-[#0F9D58]" />
      <h2 className="text-lg font-bold text-[#0F9D58]">Pessoas e Cultura</h2>
    </div>
    <ul className="space-y-2">
      <li>
        <button
          className={`w-full flex items-center gap-2 px-4 py-2 text-left rounded-md transition
            ${activeTab === "informativos"
              ? "bg-[#0F9D58] text-white"
              : "bg-[#E6F4EA] text-[#0F9D58] hover:bg-[#D8F1E1]"}
          `}
          onClick={() => {
            setActiveTab("informativos");
            setSelectedButtonId(null);
          }}
        >
          <BookOpenIcon className="w-5 h-5" />
          Informativos
        </button>
      </li>
      <li>
        <button
          className={`w-full flex items-center gap-2 px-4 py-2 text-left rounded-md transition
            ${activeTab === "orientador"
              ? "bg-[#0F9D58] text-white"
              : "bg-[#E6F4EA] text-[#0F9D58] hover:bg-[#D8F1E1]"}
          `}
          onClick={() => {
            setActiveTab("orientador");
            setSelectedButtonId(null);
          }}
        >
          <ClipboardIcon className="w-5 h-5" />
          Orientador
        </button>
      </li>
      <li>
        <button
          className={`w-full flex items-center gap-2 px-4 py-2 text-left rounded-md transition
            ${activeTab === "colaboradores"
              ? "bg-[#0F9D58] text-white"
              : "bg-[#E6F4EA] text-[#0F9D58] hover:bg-[#D8F1E1]"}
          `}
          onClick={() => {
            setActiveTab("colaboradores");
            setSelectedButtonId(null);
          }}
        >
          <UsersIcon className="w-5 h-5" />
          Colaboradores
        </button>
      </li>
    </ul>
  </aside>
);

export default PessoasCulturaSidebar;
