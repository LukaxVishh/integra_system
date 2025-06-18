import { BriefcaseIcon, ArrowTrendingUpIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const Sidebar: React.FC = () => (
  <aside className="w-64 bg-white rounded-2xl shadow p-4 hidden lg:block border border-[#E6F4EA]">
    <h2 className="text-lg font-bold text-[#0F9D58] mb-4">Menu</h2>
    <ul className="space-y-2">
      <li>
        <button
          className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
          onClick={() => console.log("Ciclo de Crédito")}
        >
          <BriefcaseIcon className="w-5 h-5" />
          Ciclo de Crédito
        </button>
      </li>
      <li>
        <button
          className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
          onClick={() => console.log("Negócios")}
        >
          <ArrowTrendingUpIcon className="w-5 h-5" />
          Negócios
        </button>
      </li>
      <li>
        <button
          className="w-full flex items-center gap-2 px-4 py-2 text-left text-[#0F9D58] bg-[#E6F4EA] rounded-md hover:bg-[#D8F1E1] transition"
          onClick={() => console.log("Processos de Qualidade")}
        >
          <CheckCircleIcon className="w-5 h-5" />
          Processos de Qualidade
        </button>
      </li>
    </ul>
  </aside>
);

export default Sidebar;
