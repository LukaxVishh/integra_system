import { useNavigate } from "react-router-dom";
import { BriefcaseIcon, ArrowTrendingUpIcon, Bars3Icon, ClipboardDocumentCheckIcon, BanknotesIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { HandshakeIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="inline-block bg-white rounded-2xl shadow p-4 border border-[#E6F4EA]">
      <div className="flex items-center gap-2 mb-4">
        <Bars3Icon className="w-5 h-5 text-[#0F9D58]" />
        <h2 className="text-lg font-bold text-[#0F9D58]">Menu</h2>
      </div>
      <ul className="space-y-2">
        <li>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
            onClick={() => navigate("/ciclo-credito")}
          >
            <BanknotesIcon className="w-5 h-5 text-[#0F9D58]" />
            Ciclo de Crédito
          </button>
        </li>
        <li>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
            onClick={() => navigate("/controles-internos")}
          >
            <ShieldCheckIcon className="w-5 h-5" />
            Controles Internos
          </button>
        </li>
        <li>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
            onClick={() => navigate("/cooperativismo")}
          >
            <HandshakeIcon className="w-5 h-5 text-[#0F9D58]" />
            Desenvolvimento do Cooperativismo
          </button>
        </li>
        <li>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
            onClick={() => navigate("/negocios")}
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            Negócios
          </button>
        </li>
        <li>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
            onClick={() => navigate("/operacoes")}
          >
            <BriefcaseIcon  className="w-5 h-5" />
            Operações Administrativas
          </button>
        </li>
        <li>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
            onClick={() => navigate("/pessoas-cultura")}
          >
            <IdentificationIcon className="w-5 h-5 text-[#0F9D58]" />
            Pessoas e Cultura
          </button>
        </li>
        <li>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
            onClick={() => navigate("/processos")}
          >
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-[#0F9D58]" />
            Processos de Qualidade
          </button>
        </li>
        <li>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
            onClick={() => navigate("/servicos-compartilhados")}
          >
            <UsersIcon className="w-5 h-5 text-[#0F9D58]" />
            Serviços Compartilhados
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
